"""
Autentiseringsruter for eiendomsmuligheter-plattformen.
Håndterer brukerregistrering, innlogging, og tokenvalidering.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime, timedelta
import jwt
from passlib.context import CryptContext
import os
import json
import logging

# Oppsett av logging
logger = logging.getLogger(__name__)

# Oppsett av router
router = APIRouter(
    prefix="/auth",
    tags=["auth"],
    responses={
        404: {"description": "Not found"}
    }
)

# JWT-konfigurasjon
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "hemmelig_nøkkel_som_bør_endres_i_produksjon")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 timer

# Sikkerhetskonfigurasjon
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

# Datamodeller
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str

class UserBase(BaseModel):
    username: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    
    class Config:
        orm_mode = True

# Simulert brukerdatabase (i produksjon ville dette være koblet til en database)
users_db = {
    "testuser": {
        "id": 1,
        "username": "testuser",
        "email": "test@example.com",
        "full_name": "Test Bruker",
        "hashed_password": pwd_context.hash("testuser"),
        "is_active": True
    },
    "admin": {
        "id": 2,
        "username": "admin",
        "email": "admin@example.com",
        "full_name": "Admin Bruker",
        "hashed_password": pwd_context.hash("adminpassword"),
        "is_active": True
    }
}

# Hjelpefunksjoner
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def get_user(username: str):
    if username in users_db:
        user_dict = users_db[username]
        return User(**user_dict)
    return None

def authenticate_user(username: str, password: str):
    user = get_user(username)
    if not user:
        return False
    if not verify_password(password, users_db[username]["hashed_password"]):
        return False
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Kunne ikke validere legitimasjon",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except jwt.PyJWTError:
        raise credentials_exception
    user = get_user(token_data.username)
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)):
    if not users_db[current_user.username]["is_active"]:
        raise HTTPException(status_code=400, detail="Inaktiv bruker")
    return current_user

# Ruter
@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    logger.info(f"Innloggingsforsøk for bruker: {form_data.username}")
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        logger.warning(f"Innloggingsforsøk mislyktes for bruker: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Feil brukernavn eller passord",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    logger.info(f"Vellykket innlogging for bruker: {form_data.username}")
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/users/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user

@router.post("/users/", response_model=User)
async def create_user(user: UserCreate):
    if user.username in users_db:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Brukernavn er allerede i bruk",
        )
    
    hashed_password = get_password_hash(user.password)
    user_id = len(users_db) + 1
    
    # Legg til ny bruker i databasen
    users_db[user.username] = {
        "id": user_id,
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name,
        "hashed_password": hashed_password,
        "is_active": user.is_active
    }
    
    logger.info(f"Ny bruker opprettet: {user.username}")
    return User(**users_db[user.username])

@router.get("/status")
async def auth_status(current_user: User = Depends(get_current_active_user)):
    return {
        "status": "authenticated",
        "user": current_user.username,
        "timestamp": datetime.utcnow().isoformat()
    }
