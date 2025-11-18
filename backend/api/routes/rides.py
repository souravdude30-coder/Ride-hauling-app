from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from models.ride import Ride, RideRequest, RideUpdate, RideEstimate, RideType, RideStatus
from services.osm_service import osm_service
from database import db
import random
import asyncio
from datetime import datetime, timedelta

router = APIRouter(prefix="/rides", tags=["rides"])

# Mock fare calculation
def calculate_fare(distance_km: float, duration_minutes: int, ride_type: RideType, surge: float = 1.0) -> float:
    base_fares = {
        RideType.UBERX: {"base": 2.5, "per_km": 1.2, "per_min": 0.3},
        RideType.UBERSHARE: {"base": 1.5, "per_km": 0.8, "per_min": 0.2},
        RideType.COMFORT: {"base": 3.0, "per_km": 1.5, "per_min": 0.4},
        RideType.XL: {"base": 3.5, "per_km": 1.8, "per_min": 0.5}
    }
    
    fare_config = base_fares.get(ride_type, base_fares[RideType.UBERX])
    fare = (fare_config["base"] + 
            distance_km * fare_config["per_km"] + 
            duration_minutes * fare_config["per_min"]) * surge
    
    return round(fare, 2)

@router.post("/estimate")
async def get_ride_estimates(request: RideRequest):
    """
    Get ride estimates for different ride types
    """
    try:
        # Calculate route using OSM
        route = await osm_service.calculate_route(
            (request.pickup_lat, request.pickup_lon),
            (request.destination_lat, request.destination_lon)
        )
        
        if not route:
            raise HTTPException(status_code=400, detail="Route calculation failed")
        
        distance_km = route["distance"] / 1000
        duration_minutes = route["duration"] / 60
        
        # Mock surge pricing
        surge_multiplier = random.choice([1.0, 1.0, 1.0, 1.2, 1.5])  # Usually no surge
        
        estimates = []
        ride_types = [RideType.UBERX, RideType.UBERSHARE, RideType.COMFORT, RideType.XL]
        
        for ride_type in ride_types:
            fare = calculate_fare(distance_km, duration_minutes, ride_type, surge_multiplier)
            eta = random.randint(2, 8)  # Mock ETA
            available_drivers = random.randint(3, 15)
            
            estimates.append(RideEstimate(
                ride_type=ride_type,
                estimated_fare=fare,
                distance=round(distance_km, 2),
                duration=int(duration_minutes),
                eta=eta,
                surge_multiplier=surge_multiplier,
                available_drivers=available_drivers
            ))
        
        return {
            "success": True,
            "data": {
                "estimates": estimates,
                "route": {
                    "geometry": route["geometry"],
                    "distance_km": round(distance_km, 2),
                    "duration_minutes": int(duration_minutes)
                }
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Estimate calculation failed: {str(e)}")

@router.post("/book")
async def book_ride(request: RideRequest):
    """
    Book a new ride
    """
    try:
        # Calculate route and fare
        route = await osm_service.calculate_route(
            (request.pickup_lat, request.pickup_lon),
            (request.destination_lat, request.destination_lon)
        )
        
        if not route:
            raise HTTPException(status_code=400, detail="Route calculation failed")
        
        distance_km = route["distance"] / 1000
        duration_minutes = route["duration"] / 60
        fare = calculate_fare(distance_km, duration_minutes, request.ride_type)
        
        # Create ride
        ride = Ride(
            user_id="user_123",  # TODO: Get from auth
            ride_type=request.ride_type,
            pickup_location={
                "address": request.pickup_address,
                "lat": request.pickup_lat,
                "lon": request.pickup_lon,
                "landmark": request.pickup_landmark
            },
            destination_location={
                "address": request.destination_address,
                "lat": request.destination_lat,
                "lon": request.destination_lon,
                "landmark": request.destination_landmark
            },
            fare=fare,
            estimated_fare=fare,
            payment_method_id=request.payment_method_id,
            scheduled_time=request.scheduled_time
        )
        
        # Save to database
        ride_dict = ride.dict()
        result = await db.rides.insert_one(ride_dict)
        ride_dict["_id"] = str(result.inserted_id)
        
        # Simulate driver assignment after 3 seconds
        asyncio.create_task(assign_driver_async(ride.id))
        
        return {
            "success": True,
            "data": ride_dict,
            "message": "Ride booked successfully. Finding a driver..."
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ride booking failed: {str(e)}")

async def assign_driver_async(ride_id: str):
    """
    Simulate driver assignment
    """
    await asyncio.sleep(3)  # Simulate search time
    
    # Mock driver assignment
    driver_id = f"driver_{random.randint(1, 100)}"
    arrival_time = datetime.utcnow() + timedelta(minutes=random.randint(3, 8))
    
    await db.rides.update_one(
        {"id": ride_id},
        {
            "$set": {
                "status": RideStatus.DRIVER_ASSIGNED,
                "driver_id": driver_id,
                "driver_arrival_time": arrival_time,
                "updated_at": datetime.utcnow()
            }
        }
    )

@router.get("/{ride_id}")
async def get_ride(ride_id: str):
    """
    Get ride details
    """
    ride = await db.rides.find_one({"id": ride_id})
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")
    
    return {
        "success": True,
        "data": ride
    }

@router.put("/{ride_id}")
async def update_ride(ride_id: str, update: RideUpdate):
    """
    Update ride status
    """
    update_data = {k: v for k, v in update.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    result = await db.rides.update_one(
        {"id": ride_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Ride not found")
    
    updated_ride = await db.rides.find_one({"id": ride_id})
    return {
        "success": True,
        "data": updated_ride
    }

@router.get("/user/{user_id}")
async def get_user_rides(user_id: str, limit: int = 20):
    """
    Get user's ride history
    """
    rides = await db.rides.find(
        {"user_id": user_id}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    
    return {
        "success": True,
        "data": rides,
        "count": len(rides)
    }