from pydantic import BaseModel
from typing import Optional
from .ride import RideType

class RideEstimateRequest(BaseModel):
    pickup_address: str
    pickup_lat: float
    pickup_lon: float
    destination_address: str
    destination_lat: float
    destination_lon: float
    ride_type: Optional[RideType] = None  # If None, get all estimates