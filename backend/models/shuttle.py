from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime, time
from enum import Enum
import uuid

class ShuttleStatus(str, Enum):
    SCHEDULED = "scheduled"
    BOARDING = "boarding"
    IN_TRANSIT = "in_transit"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class ShuttleHotspot(BaseModel):
    id: str
    name: str
    address: str
    lat: float
    lon: float
    pickup_time: Optional[time] = None
    drop_time: Optional[time] = None

class ShuttleRoute(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    duration_min: int
    duration_max: int
    distance_km: float
    price: float
    pickup_hotspots: List[ShuttleHotspot]
    drop_hotspots: List[ShuttleHotspot]
    capacity: int = 45
    amenities: List[str] = []
    frequency_minutes: int = 15
    operating_start: time
    operating_end: time
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ShuttleSchedule(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    route_id: str
    departure_time: time
    available_seats: int
    total_seats: int
    bus_number: Optional[str] = None
    driver_name: Optional[str] = None
    is_active: bool = True

class ShuttleBooking(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    route_id: str
    schedule_id: str
    pickup_hotspot_id: str
    drop_hotspot_id: str
    booking_date: datetime
    departure_time: time
    passenger_name: str
    passenger_phone: str
    seat_number: Optional[str] = None
    fare: float
    status: ShuttleStatus = ShuttleStatus.SCHEDULED
    payment_method_id: str
    booking_reference: str = Field(default_factory=lambda: f"SH{str(uuid.uuid4())[:8].upper()}")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ShuttleBookingRequest(BaseModel):
    route_id: str
    pickup_hotspot_id: str
    drop_hotspot_id: str
    booking_date: str  # YYYY-MM-DD format
    departure_time: str  # HH:MM format
    payment_method_id: str

class ShuttleBus(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    bus_number: str
    route_id: str
    driver_name: str
    driver_phone: str
    current_location: Optional[Dict] = None  # {lat, lon, updated_at}
    capacity: int = 45
    amenities: List[str] = []
    status: str = "active"  # active, maintenance, offline
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ShuttleTracking(BaseModel):
    booking_id: str
    bus_id: str
    current_status: ShuttleStatus
    current_location: Dict  # {lat, lon, address}
    eta_minutes: Optional[int] = None
    next_stop: Optional[Dict] = None  # {name, eta_minutes}
    passengers_onboard: List[Dict] = []  # [{name, destination}]
    live_updates: List[Dict] = []  # [{timestamp, message, location}]