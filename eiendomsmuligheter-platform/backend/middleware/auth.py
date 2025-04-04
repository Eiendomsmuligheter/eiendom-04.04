"""
Authentication and authorization middleware for the FastAPI application

This module provides comprehensive JWT-based authentication with role-based
authorization and security features including token refresh, brute force protection,
and secure password handling.
"""
import os
import jwt
import time
import logging
from datetime import datetime, timedelta
from typing import Dict, Optional, List, Union, Any
from fastapi import Depends, FastAPI, HTTPException, Security, status, Request, Response
from fastapi.security import OAuth2PasswordBearer, SecurityScopes
from jwt.exceptions import PyJWTError, ExpiredSignatureError, InvalidTokenError
from passlib.context import CryptContext
from pydantic import BaseModel, ValidationError, EmailStr, Field
import uuid
import redis
from functools import lru_cache

# Configure logging
logger = logging.getLogger(__name__)

# Security configuration with environment variables and secure defaults
SECRET_KEY = os.getenv("SECRET_KEY", "eiendomsmuligheter_development_key")
if os.getenv("ENVIRONMENT") == "production" and SECRET_KEY == "eiendomsmuligheter_development_key":
    logger.warning("Using default SECRET_KEY in production environment! This is insecure.")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))  # 24 hours default
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "30"))  # 30 days default

# Configure Redis for token blacklisting and rate limiting
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
try:
    redis_client = redis.from_url(REDIS_URL)
    REDIS_AVAILABLE = True
except:
    logger.warning("Redis connection failed. Token blacklisting and rate limiting disabled.")
    REDIS_AVAILABLE = False

# Password hashing with bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme for token handling with comprehensive scopes
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/auth/token",
    scopes={
        "user": "Standard user access for basic property search and viewing",
        "premium": "Premium user access for detailed analysis and reports",
        "partner": "Partner access for professional property tools",
        "admin": "Administrator access with full system control",
    },
)

# Models
class Token(BaseModel):
    """Token response model with comprehensive token information"""
    access_token: str
    token_type: str
    expires_at: datetime
    refresh_token: Optional[str] = None
    user_id: str
    scopes: List[str]

class TokenData(BaseModel):
    """Internal token data model for decoded JWT payload"""
    user_id: Optional[str] = None
    email: Optional[str] = None
    scopes: List[str] = []
    exp: Optional[datetime] = None
    jti: Optional[str] = None  # JWT ID for token blacklisting

class UserBase(BaseModel):
    """Base user model with common fields"""
    email: EmailStr
    full_name: str
    disabled: Optional[bool] = False
    
class UserCreate(UserBase):
    """User creation model with password validation"""
    password: str = Field(..., min_length=8)
    user_type: str = "user"
    
    class Config:
        schema_extra = {
            "example": {
                "email": "user@example.com",
                "full_name": "John Doe",
                "password": "securepassword",
                "user_type": "user"
            }
        }

class User(UserBase):
    """User model returned to API clients"""
    id: str
    scopes: List[str] = []
    created_at: Optional[datetime] = None
    last_login: Optional[datetime] = None
    
    class Config:
        schema_extra = {
            "example": {
                "id": "user-123",
                "email": "user@example.com",
                "full_name": "John Doe",
                "scopes": ["user"],
                "disabled": False,
                "created_at": "2023-01-01T00:00:00Z",
                "last_login": "2023-01-02T00:00:00Z"
            }
        }

# Authentication functions
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash using bcrypt"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Generate a secure password hash using bcrypt"""
    return pwd_context.hash(password)

def create_token(data: dict, expires_delta: Optional[timedelta] = None, token_type: str = "access") -> str:
    """
    Create a new JWT token with comprehensive security features
    
    Args:
        data: Payload data for the token
        expires_delta: Token expiration time
        token_type: Type of token (access or refresh)
        
    Returns:
        JWT token string
    """
    to_encode = data.copy()
    
    # Set expiration time based on token type
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    elif token_type == "refresh":
        expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Add standard JWT claims
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),  # Issued at
        "jti": str(uuid.uuid4()),  # Unique token ID for blacklisting
        "type": token_type         # Token type for validation
    })
    
    # Sign the token
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a new access token"""
    return create_token(data, expires_delta, "access")

def create_refresh_token(data: dict) -> str:
    """Create a new refresh token with longer expiration"""
    return create_token(data, None, "refresh")

def blacklist_token(jti: str, exp: datetime) -> bool:
    """
    Blacklist a token by its JTI (JWT ID)
    
    Args:
        jti: The JWT ID to blacklist
        exp: The token expiration time
        
    Returns:
        True if successful, False otherwise
    """
    if not REDIS_AVAILABLE:
        logger.warning("Redis not available. Token blacklisting disabled.")
        return False
    
    # Calculate time to expiration
    now = datetime.utcnow()
    if exp < now:
        # Token already expired, no need to blacklist
        return True
    
    ttl = int((exp - now).total_seconds())
    try:
        # Store in Redis with TTL matching token expiration
        redis_client.setex(f"blacklist:{jti}", ttl, "1")
        return True
    except Exception as e:
        logger.error(f"Failed to blacklist token: {str(e)}")
        return False

def is_token_blacklisted(jti: str) -> bool:
    """
    Check if a token is blacklisted
    
    Args:
        jti: The JWT ID to check
        
    Returns:
        True if blacklisted, False otherwise
    """
    if not REDIS_AVAILABLE:
        return False
    
    try:
        return redis_client.exists(f"blacklist:{jti}") == 1
    except Exception as e:
        logger.error(f"Failed to check token blacklist: {str(e)}")
        return False

def check_rate_limit(key: str, limit: int, period: int) -> bool:
    """
    Check if a rate limit has been exceeded
    
    Args:
        key: The rate limit key (e.g. IP, user ID)
        limit: Maximum number of requests
        period: Time period in seconds
        
    Returns:
        True if limit not exceeded, False otherwise
    """
    if not REDIS_AVAILABLE:
        return True
    
    try:
        # Get current count
        current = redis_client.get(f"ratelimit:{key}")
        if current is None:
            # First request, set to 1 with expiration
            redis_client.setex(f"ratelimit:{key}", period, 1)
            return True
        
        # Increment count
        count = redis_client.incr(f"ratelimit:{key}")
        if int(count) > limit:
            return False
        
        return True
    except Exception as e:
        logger.error(f"Failed to check rate limit: {str(e)}")
        return True  # Fail open if Redis is unavailable

async def get_current_user(
    security_scopes: SecurityScopes, 
    token: str = Depends(oauth2_scheme),
    request: Request = None,
    response: Response = None
) -> User:
    """
    Get the current user from the token with comprehensive validation
    
    Args:
        security_scopes: Required security scopes
        token: JWT token
        request: FastAPI request object
        response: FastAPI response object
        
    Returns:
        User object
        
    Raises:
        HTTPException: If token is invalid or user lacks required scopes
    """
    # Set authenticate value based on scopes
    if security_scopes.scopes:
        authenticate_value = f'Bearer scope="{security_scopes.scope_str}"'
    else:
        authenticate_value = "Bearer"
    
    # Create exception for authentication failures
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Kunne ikke validere legitimasjon",
        headers={"WWW-Authenticate": authenticate_value},
    )
    
    try:
        # Decode and validate the token
        payload = jwt.decode(
            token, 
            SECRET_KEY, 
            algorithms=[ALGORITHM],
            options={"verify_signature": True, "verify_exp": True}
        )
        
        # Extract token data
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        
        token_scopes = payload.get("scopes", [])
        token_type = payload.get("type", "")
        jti = payload.get("jti", "")
        
        # Validate token type
        if token_type != "access":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Ugyldig token type",
                headers={"WWW-Authenticate": authenticate_value},
            )
        
        # Check if token is blacklisted
        if jti and is_token_blacklisted(jti):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token er ikke lenger gyldig",
                headers={"WWW-Authenticate": authenticate_value},
            )
        
        # Create token data
        token_exp = datetime.fromtimestamp(payload.get("exp", 0))
        token_data = TokenData(
            user_id=user_id, 
            scopes=token_scopes, 
            exp=token_exp,
            jti=jti,
            email=payload.get("email")
        )
        
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token har utløpt",
            headers={"WWW-Authenticate": authenticate_value},
        )
    except (PyJWTError, ValidationError) as e:
        logger.error(f"Token validation error: {str(e)}")
        raise credentials_exception
    
    # In a real application, we would fetch the user from the database here
    # For now, we'll simulate this by returning a user based on the token data
    user = User(
        id=token_data.user_id,
        email=token_data.email or f"{token_data.user_id}@example.com",  # Placeholder
        full_name="Test User",  # Placeholder
        scopes=token_data.scopes
    )
    
    # Check if token has expired
    if datetime.utcnow() > token_data.exp:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired",
            headers={"WWW-Authenticate": authenticate_value},
        )
    
    # Check for required scopes
    for scope in security_scopes.scopes:
        if scope not in token_data.scopes:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Ikke tilstrekkelige rettigheter. Krever scope: {scope}",
                headers={"WWW-Authenticate": authenticate_value},
            )
    
    # If a refresh token is about to expire, issue a new one
    if token_data.exp - datetime.utcnow() < timedelta(minutes=30) and response:
        # In a real implementation, we would get a new token from the database
        # For now, we'll simulate this
        new_token = create_access_token(
            data={"sub": user.id, "scopes": user.scopes, "email": user.email}
        )
        response.headers["X-New-Token"] = new_token
    
    return user

async def get_current_active_user(
    current_user: User = Security(get_current_user, scopes=["user"])
) -> User:
    """
    Check if the current user is active
    
    Args:
        current_user: User object from get_current_user
        
    Returns:
        User object if active
        
    Raises:
        HTTPException: If user is disabled
    """
    if current_user.disabled:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inaktiv bruker")
    return current_user

async def get_premium_user(
    current_user: User = Security(get_current_user, scopes=["premium"])
) -> User:
    """Get a user with premium privileges"""
    return current_user

async def get_partner_user(
    current_user: User = Security(get_current_user, scopes=["partner"])
) -> User:
    """Get a user with partner privileges"""
    return current_user

async def get_admin_user(
    current_user: User = Security(get_current_user, scopes=["admin"])
) -> User:
    """Get a user with admin privileges"""
    return current_user

@lru_cache(maxsize=128)
def get_user_permissions(user_id: str, resource_type: str) -> Dict[str, bool]:
    """
    Get a user's permissions for a resource type
    
    Args:
        user_id: User ID
        resource_type: Type of resource (e.g. property, analysis)
        
    Returns:
        Dictionary of permission names and boolean values
    """
    # In a real implementation, this would fetch permissions from the database
    # For now, return a default set of permissions
    return {
        "read": True,
        "write": False,
        "delete": False,
        "share": False,
    }

def has_permission(user: User, permission: str, resource_type: str) -> bool:
    """
    Check if a user has a specific permission for a resource type
    
    Args:
        user: User object
        permission: Permission name (e.g. read, write)
        resource_type: Type of resource (e.g. property, analysis)
        
    Returns:
        True if user has permission, False otherwise
    """
    # Admins have all permissions
    if "admin" in user.scopes:
        return True
    
    # Partners have extended permissions
    if permission == "read" and "partner" in user.scopes:
        return True
    
    # Check specific permissions
    permissions = get_user_permissions(user.id, resource_type)
    return permissions.get(permission, False) 