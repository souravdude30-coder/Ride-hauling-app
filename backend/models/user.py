from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime
import uuid

class Location(BaseModel):
    name: str
    address: str
    lat: float
    lon: float

class PaymentMethod(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str  # card, paypal, cash
    brand: Optional[str] = None  # visa, mastercard, etc.
    last4: Optional[str] = None
    email: Optional[str] = None  # for paypal
    is_default: bool = False

class UserProfile(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: str
    profile_image: Optional[str] = None
    rating: Optional[float] = 4.8
    total_rides: int = 0
    member_since: datetime = Field(default_factory=datetime.utcnow)
    recent_locations: List[Location] = []
    payment_methods: List[PaymentMethod] = []
    preferences: dict = {}
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    profile_image: Optional[str] = None
    preferences: Optional[dict] = None