from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid

class Vehicle(BaseModel):
    make: str
    model: str
    color: str
    plate: str
    year: int
    capacity: int = 4

class DriverLocation(BaseModel):
    lat: float
    lon: float
    heading: Optional[float] = None  # Direction in degrees
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class DriverProfile(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: str
    profile_image: Optional[str] = None
    rating: float = 4.8
    total_rides: int = 0
    years_driving: int = 0
    license_number: str
    vehicle: Vehicle
    current_location: Optional[DriverLocation] = None
    is_online: bool = False
    is_available: bool = True
    status: str = "offline"  # offline, online, busy, break
    earnings_today: float = 0.0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class DriverCreate(BaseModel):
    name: str
    email: str
    phone: str
    license_number: str
    vehicle: Vehicle
    password: str

class DriverLocationUpdate(BaseModel):
    lat: float
    lon: float
    heading: Optional[float] = None

class DriverStatusUpdate(BaseModel):
    is_online: Optional[bool] = None
    is_available: Optional[bool] = None
    status: Optional[str] = None