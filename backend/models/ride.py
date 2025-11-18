from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime
from enum import Enum
import uuid

class RideStatus(str, Enum):
    PENDING = "pending"
    DRIVER_ASSIGNED = "driver_assigned"
    DRIVER_ARRIVING = "driver_arriving"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class RideType(str, Enum):
    UBERX = "uberx"
    UBERSHARE = "ubershare"
    COMFORT = "comfort"
    XL = "xl"

class RideLocation(BaseModel):
    address: str
    lat: float
    lon: float
    landmark: Optional[str] = None

class SharedPassenger(BaseModel):
    name: str
    pickup: str
    destination: str
    phone: Optional[str] = None

class RideRoute(BaseModel):
    distance: float  # km
    duration: int   # minutes
    geometry: Optional[dict] = None
    waypoints: Optional[List[dict]] = None

class Ride(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    driver_id: Optional[str] = None
    ride_type: RideType
    status: RideStatus = RideStatus.PENDING
    pickup_location: RideLocation
    destination_location: RideLocation
    route: Optional[RideRoute] = None
    fare: float
    estimated_fare: Optional[float] = None
    surge_multiplier: float = 1.0
    payment_method_id: str
    shared_passengers: Optional[List[SharedPassenger]] = []
    scheduled_time: Optional[datetime] = None
    driver_arrival_time: Optional[datetime] = None
    pickup_time: Optional[datetime] = None
    dropoff_time: Optional[datetime] = None
    rating: Optional[int] = None
    feedback: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class RideRequest(BaseModel):
    pickup_address: str
    pickup_lat: float
    pickup_lon: float
    destination_address: str
    destination_lat: float
    destination_lon: float
    ride_type: RideType
    payment_method_id: str
    scheduled_time: Optional[datetime] = None
    pickup_landmark: Optional[str] = None
    destination_landmark: Optional[str] = None

class RideUpdate(BaseModel):
    status: Optional[RideStatus] = None
    driver_id: Optional[str] = None
    driver_arrival_time: Optional[datetime] = None
    pickup_time: Optional[datetime] = None
    dropoff_time: Optional[datetime] = None

class RideEstimate(BaseModel):
    ride_type: RideType
    estimated_fare: float
    distance: float
    duration: int
    eta: int
    surge_multiplier: float = 1.0
    available_drivers: int = 0