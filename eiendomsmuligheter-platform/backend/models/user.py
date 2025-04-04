"""
User models for the Eiendomsmuligheter Platform API.

This module provides data models for user representation, including:
- Base user data model
- User creation model with validation
- User update model
- User roles and permissions
"""
from pydantic import BaseModel, EmailStr, validator, Field
from datetime import datetime
from typing import Optional, List, Dict, Any
import re
import uuid

class UserBase(BaseModel):
    """Base model for user data"""
    email: EmailStr
    full_name: str
    disabled: bool = False
    
    class Config:
        orm_mode = True

class UserCreate(UserBase):
    """Model for user creation with password validation"""
    password: str = Field(..., min_length=8)
    user_type: str = "user"
    
    @validator('password')
    def password_strength(cls, v):
        """Validate password strength"""
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one digit')
        return v
    
    @validator('user_type')
    def valid_user_type(cls, v):
        """Validate user type"""
        allowed_types = ["user", "partner", "admin", "premium"]
        if v not in allowed_types:
            raise ValueError(f'User type must be one of: {", ".join(allowed_types)}')
        return v
    
    class Config:
        schema_extra = {
            "example": {
                "email": "user@example.com",
                "full_name": "John Doe",
                "password": "Password123",
                "user_type": "user",
                "disabled": False
            }
        }

class UserUpdate(BaseModel):
    """Model for updating user data"""
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    disabled: Optional[bool] = None
    user_type: Optional[str] = None
    
    @validator('user_type')
    def valid_user_type(cls, v):
        """Validate user type"""
        if v is None:
            return v
        allowed_types = ["user", "partner", "admin", "premium"]
        if v not in allowed_types:
            raise ValueError(f'User type must be one of: {", ".join(allowed_types)}')
        return v
    
    class Config:
        schema_extra = {
            "example": {
                "email": "updated_email@example.com",
                "full_name": "Updated Name",
                "user_type": "premium",
                "disabled": False
            }
        }

class User(UserBase):
    """Complete user model with all fields"""
    id: str
    user_type: str
    created_at: datetime
    last_login: Optional[datetime] = None
    subscription_status: Optional[str] = None
    subscription_expires: Optional[datetime] = None
    company_name: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    preferences: Dict[str, Any] = Field(default_factory=dict)
    saved_properties: List[str] = Field(default_factory=list)
    usage_stats: Dict[str, Any] = Field(default_factory=dict)
    
    class Config:
        orm_mode = True
        schema_extra = {
            "example": {
                "id": "user-123",
                "email": "user@example.com",
                "full_name": "John Doe",
                "user_type": "premium",
                "disabled": False,
                "created_at": "2023-01-01T00:00:00Z",
                "last_login": "2023-01-02T00:00:00Z",
                "subscription_status": "active",
                "subscription_expires": "2024-01-01T00:00:00Z",
                "company_name": "Acme Inc",
                "phone_number": "+47 12345678",
                "address": "Oslo, Norway",
                "preferences": {
                    "notifications": True,
                    "language": "no",
                    "theme": "light"
                },
                "saved_properties": ["property-123", "property-456"],
                "usage_stats": {
                    "api_calls": 150,
                    "last_activity": "2023-01-02T00:00:00Z"
                }
            }
        }

class UserInDB(User):
    """Database representation of user with hashed password"""
    hashed_password: str
    
    class Config:
        orm_mode = True

class TokenData(BaseModel):
    """Token data model"""
    user_id: Optional[str] = None
    email: Optional[str] = None
    scopes: List[str] = []
    exp: Optional[int] = None

class Token(BaseModel):
    """Access token response model"""
    access_token: str
    token_type: str
    expires_at: datetime
    refresh_token: Optional[str] = None
    user_id: str
    scopes: List[str] = []
    
    class Config:
        schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "expires_at": "2023-01-02T00:00:00Z",
                "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "user_id": "user-123",
                "scopes": ["user", "premium"]
            }
        }

def generate_user_id() -> str:
    """Generate a unique user ID"""
    return f"user-{uuid.uuid4().hex[:8]}"

def validate_phone_number(phone: str) -> bool:
    """Validate Norwegian phone number format"""
    pattern = r'^\+?(?:47)?[ ]?(?:\d{8}|\d{3}[ ]?\d{2}[ ]?\d{3}|\d{2}[ ]?\d{2}[ ]?\d{2}[ ]?\d{2})$'
    return bool(re.match(pattern, phone))

def validate_email_address(email: str) -> bool:
    """Validate email address format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email)) 