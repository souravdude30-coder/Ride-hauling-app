from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from models.shuttle import ShuttleRoute, ShuttleBooking, ShuttleBookingRequest, ShuttleSchedule, ShuttleBus, ShuttleStatus
from database import db
from datetime import datetime, time, timedelta
import random

router = APIRouter(prefix="/shuttles", tags=["shuttles"])

@router.get("/routes")
async def get_shuttle_routes():
    """
    Get all available shuttle routes
    """
    try:
        routes = await db.shuttle_routes.find({"is_active": True}).to_list(100)
        return {
            "success": True,
            "data": routes,
            "count": len(routes)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch routes: {str(e)}")

@router.get("/routes/{route_id}")
async def get_shuttle_route(route_id: str):
    """
    Get specific shuttle route details
    """
    route = await db.shuttle_routes.find_one({"id": route_id})
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    
    return {
        "success": True,
        "data": route
    }

@router.get("/routes/{route_id}/schedules")
async def get_route_schedules(route_id: str, date: Optional[str] = None):
    """
    Get available schedules for a route on a specific date
    """
    if not date:
        date = datetime.utcnow().strftime("%Y-%m-%d")
    
    try:
        # Mock schedule data - in production, this would come from database
        base_times = ["07:00", "07:30", "08:00", "08:30", "09:00", "17:30", "18:00", "18:30", "19:00"]
        schedules = []
        
        for time_str in base_times:
            available_seats = random.randint(5, 40)
            schedules.append({
                "id": f"schedule_{route_id}_{time_str.replace(':', '')}",
                "route_id": route_id,
                "departure_time": time_str,
                "available_seats": available_seats,
                "total_seats": 45,
                "bus_number": f"HR26AB{random.randint(1000, 9999)}",
                "driver_name": random.choice(["Rajesh Kumar", "Amit Singh", "Suresh Sharma"]),
                "is_active": True
            })
        
        return {
            "success": True,
            "data": schedules,
            "date": date
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch schedules: {str(e)}")

@router.post("/book")
async def book_shuttle(booking_request: ShuttleBookingRequest):
    """
    Book a shuttle seat
    """
    try:
        # Get route details
        route = await db.shuttle_routes.find_one({"id": booking_request.route_id})
        if not route:
            raise HTTPException(status_code=404, detail="Route not found")
        
        # Find pickup and drop hotspots
        pickup_hotspot = next(
            (h for h in route["pickup_hotspots"] if h["id"] == booking_request.pickup_hotspot_id),
            None
        )
        drop_hotspot = next(
            (h for h in route["drop_hotspots"] if h["id"] == booking_request.drop_hotspot_id),
            None
        )
        
        if not pickup_hotspot or not drop_hotspot:
            raise HTTPException(status_code=400, detail="Invalid hotspot selection")
        
        # Create booking
        booking = ShuttleBooking(
            user_id="user_123",  # TODO: Get from auth
            route_id=booking_request.route_id,
            schedule_id=f"schedule_{booking_request.route_id}_{booking_request.departure_time.replace(':', '')}",
            pickup_hotspot_id=booking_request.pickup_hotspot_id,
            drop_hotspot_id=booking_request.drop_hotspot_id,
            booking_date=datetime.strptime(booking_request.booking_date, "%Y-%m-%d"),
            departure_time=datetime.strptime(booking_request.departure_time, "%H:%M").time(),
            passenger_name="John Doe",  # TODO: Get from user profile
            passenger_phone="+91 98765 43210",  # TODO: Get from user profile
            seat_number=f"A{random.randint(10, 35)}",
            fare=route["price"],
            payment_method_id=booking_request.payment_method_id
        )
        
        # Save to database
        booking_dict = booking.dict()
        result = await db.shuttle_bookings.insert_one(booking_dict)
        booking_dict["_id"] = str(result.inserted_id)
        
        return {
            "success": True,
            "data": booking_dict,
            "message": "Shuttle booked successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Booking failed: {str(e)}")

@router.get("/bookings/{booking_id}")
async def get_shuttle_booking(booking_id: str):
    """
    Get shuttle booking details
    """
    booking = await db.shuttle_bookings.find_one({"id": booking_id})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Get route details
    route = await db.shuttle_routes.find_one({"id": booking["route_id"]})
    
    return {
        "success": True,
        "data": {
            **booking,
            "route": route
        }
    }

@router.get("/bookings/{booking_id}/track")
async def track_shuttle(booking_id: str):
    """
    Get live tracking information for shuttle
    """
    booking = await db.shuttle_bookings.find_one({"id": booking_id})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Mock tracking data
    current_status = random.choice([
        ShuttleStatus.SCHEDULED,
        ShuttleStatus.BOARDING,
        ShuttleStatus.IN_TRANSIT
    ])
    
    tracking_data = {
        "booking_id": booking_id,
        "bus_number": f"HR26AB{random.randint(1000, 9999)}",
        "current_status": current_status,
        "current_location": {
            "lat": 28.4595 + random.uniform(-0.1, 0.1),
            "lon": 77.0266 + random.uniform(-0.1, 0.1),
            "address": "Near DLF Phase 1, Gurgaon"
        },
        "eta_minutes": random.randint(5, 30) if current_status != ShuttleStatus.SCHEDULED else None,
        "next_stop": {
            "name": "Cyber Hub",
            "eta_minutes": random.randint(2, 8)
        } if current_status == ShuttleStatus.IN_TRANSIT else None,
        "passengers_onboard": [
            {"name": "Passenger A", "destination": "CP"},
            {"name": "Passenger B", "destination": "Khan Market"}
        ] if current_status == ShuttleStatus.IN_TRANSIT else [],
        "driver": {
            "name": "Rajesh Kumar",
            "phone": "+91 98765 43210",
            "rating": 4.8
        }
    }
    
    return {
        "success": True,
        "data": tracking_data
    }

@router.get("/user/{user_id}/bookings")
async def get_user_shuttle_bookings(user_id: str, limit: int = 20):
    """
    Get user's shuttle booking history
    """
    bookings = await db.shuttle_bookings.find(
        {"user_id": user_id}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    
    return {
        "success": True,
        "data": bookings,
        "count": len(bookings)
    }

@router.put("/bookings/{booking_id}/cancel")
async def cancel_shuttle_booking(booking_id: str):
    """
    Cancel a shuttle booking
    """
    result = await db.shuttle_bookings.update_one(
        {"id": booking_id},
        {
            "$set": {
                "status": ShuttleStatus.CANCELLED,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    return {
        "success": True,
        "message": "Booking cancelled successfully"
    }