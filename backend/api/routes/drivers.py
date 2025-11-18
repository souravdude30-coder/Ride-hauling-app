from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from ...models.driver import DriverProfile, DriverCreate, DriverLocationUpdate, DriverStatusUpdate
from ...models.ride import RideStatus
from ...database import db
from datetime import datetime
import random

router = APIRouter(prefix="/drivers", tags=["drivers"])

@router.post("/register")
async def register_driver(driver_data: DriverCreate):
    """
    Register a new driver
    """
    try:
        # Check if driver already exists
        existing = await db.drivers.find_one({"email": driver_data.email})
        if existing:
            raise HTTPException(status_code=400, detail="Driver already registered")
        
        # Create driver profile
        driver = DriverProfile(
            name=driver_data.name,
            email=driver_data.email,
            phone=driver_data.phone,
            license_number=driver_data.license_number,
            vehicle=driver_data.vehicle
        )
        
        # Save to database
        driver_dict = driver.dict()
        result = await db.drivers.insert_one(driver_dict)
        driver_dict["_id"] = str(result.inserted_id)
        
        return {
            "success": True,
            "data": driver_dict,
            "message": "Driver registered successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Driver registration failed: {str(e)}")

@router.put("/{driver_id}/location")
async def update_driver_location(driver_id: str, location: DriverLocationUpdate):
    """
    Update driver's current location
    """
    location_data = {
        "current_location": {
            "lat": location.lat,
            "lon": location.lon,
            "heading": location.heading,
            "updated_at": datetime.utcnow()
        },
        "updated_at": datetime.utcnow()
    }
    
    result = await db.drivers.update_one(
        {"id": driver_id},
        {"$set": location_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Driver not found")
    
    return {
        "success": True,
        "message": "Location updated successfully"
    }

@router.put("/{driver_id}/status")
async def update_driver_status(driver_id: str, status: DriverStatusUpdate):
    """
    Update driver's online/availability status
    """
    update_data = {k: v for k, v in status.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    result = await db.drivers.update_one(
        {"id": driver_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Driver not found")
    
    updated_driver = await db.drivers.find_one({"id": driver_id})
    return {
        "success": True,
        "data": updated_driver
    }

@router.get("/{driver_id}")
async def get_driver(driver_id: str):
    """
    Get driver profile
    """
    driver = await db.drivers.find_one({"id": driver_id})
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    
    return {
        "success": True,
        "data": driver
    }

@router.get("/{driver_id}/rides")
async def get_driver_rides(driver_id: str, limit: int = 20):
    """
    Get driver's ride history
    """
    rides = await db.rides.find(
        {"driver_id": driver_id}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    
    return {
        "success": True,
        "data": rides,
        "count": len(rides)
    }

@router.get("/{driver_id}/earnings")
async def get_driver_earnings(driver_id: str):
    """
    Get driver's earnings summary
    """
    # Get completed rides
    completed_rides = await db.rides.find({
        "driver_id": driver_id,
        "status": RideStatus.COMPLETED
    }).to_list(1000)
    
    total_earnings = sum(ride.get("fare", 0) * 0.8 for ride in completed_rides)  # 80% commission
    total_rides = len(completed_rides)
    
    # Calculate today's earnings
    today = datetime.utcnow().date()
    today_rides = [r for r in completed_rides if r.get("completed_at", datetime.min).date() == today]
    today_earnings = sum(ride.get("fare", 0) * 0.8 for ride in today_rides)
    
    return {
        "success": True,
        "data": {
            "total_earnings": round(total_earnings, 2),
            "total_rides": total_rides,
            "today_earnings": round(today_earnings, 2),
            "today_rides": len(today_rides),
            "average_fare": round(total_earnings / max(total_rides, 1), 2)
        }
    }

@router.get("/nearby")
async def get_nearby_drivers(
    lat: float,
    lon: float,
    radius_km: float = 5,
    ride_type: str = "uberx"
):
    """
    Find nearby available drivers
    """
    # Simple distance calculation (for demo purposes)
    # In production, use proper geospatial queries
    drivers = await db.drivers.find({
        "is_online": True,
        "is_available": True,
        "status": "online"
    }).to_list(50)
    
    nearby_drivers = []
    for driver in drivers:
        if driver.get("current_location"):
            # Mock distance calculation
            distance = random.uniform(0.5, radius_km)
            if distance <= radius_km:
                driver["distance_km"] = round(distance, 2)
                driver["eta_minutes"] = max(1, int(distance * 2))  # Rough ETA
                nearby_drivers.append(driver)
    
    # Sort by distance
    nearby_drivers.sort(key=lambda x: x["distance_km"])
    
    return {
        "success": True,
        "data": nearby_drivers[:10],  # Return top 10
        "count": len(nearby_drivers)
    }