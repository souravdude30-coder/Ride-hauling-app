from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from services.booking_service import booking_service
from services.pass_service import pass_service
from api.routes.auth import get_current_user
from models.rbac import User, Permission
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/bookings", tags=["Bookings"])

class CreateBookingRequest(BaseModel):
    pass_id: Optional[str] = None
    pickup_location: str
    dropoff_location: str
    journey_date: datetime
    shuttle_id: Optional[str] = None
    route_id: Optional[str] = None

class VerifyOTPRequest(BaseModel):
    booking_id: str
    otp: str

class VerifyQRRequest(BaseModel):
    qr_data: str

class BulkBookingRequest(BaseModel):
    route_id: str
    booking_dates: List[datetime]
    capacity: int
    payment_type: str  # "upfront" or "invoice"
    employee_ids: Optional[List[str]] = None

@router.post("/create")
async def create_booking(
    request: CreateBookingRequest,
    current_user: User = Depends(get_current_user)
):
    """Create a new booking"""
    
    try:
        # If using a pass, verify and use it
        if request.pass_id:
            pass_obj = await pass_service.get_pass(request.pass_id)
            
            if not pass_obj:
                raise HTTPException(status_code=404, detail="Pass not found")
            
            if pass_obj.user_id != current_user.id:
                raise HTTPException(status_code=403, detail="Pass does not belong to you")
            
            # Use one journey from the pass
            await pass_service.use_pass(request.pass_id)
        
        # Create booking
        booking = await booking_service.create_booking(
            user_id=current_user.id,
            pass_id=request.pass_id,
            pickup_location=request.pickup_location,
            dropoff_location=request.dropoff_location,
            journey_date=request.journey_date,
            shuttle_id=request.shuttle_id,
            route_id=request.route_id
        )
        
        return {
            "success": True,
            "booking": booking.dict()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating booking: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/my-bookings")
async def get_my_bookings(
    current_user: User = Depends(get_current_user)
):
    """Get all bookings for current user"""
    
    try:
        bookings = await booking_service.get_user_bookings(current_user.id)
        
        return {
            "bookings": [b.dict() for b in bookings]
        }
        
    except Exception as e:
        logger.error(f"Error fetching bookings: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{booking_id}")
async def get_booking_details(
    booking_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get booking details"""
    
    booking = await booking_service.get_booking(booking_id)
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Check if user owns this booking or is driver/admin
    if (booking.user_id != current_user.id and 
        booking.driver_id != current_user.id and
        Permission.SYSTEM_ADMIN not in current_user.permissions):
        raise HTTPException(status_code=403, detail="Access denied")
    
    return booking.dict()

@router.post("/verify-otp")
async def verify_otp(
    request: VerifyOTPRequest,
    current_user: User = Depends(get_current_user)
):
    """Verify OTP for booking (Driver only)"""
    
    # Check if user is a driver
    if Permission.PASSENGER_READ not in current_user.permissions:
        raise HTTPException(status_code=403, detail="Driver access required")
    
    try:
        is_valid = await booking_service.verify_booking_otp(
            booking_id=request.booking_id,
            otp=request.otp,
            driver_id=current_user.id
        )
        
        if not is_valid:
            raise HTTPException(status_code=400, detail="Invalid OTP")
        
        return {
            "success": True,
            "message": "Booking verified successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error verifying OTP: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/verify-qr")
async def verify_qr(
    request: VerifyQRRequest,
    current_user: User = Depends(get_current_user)
):
    """Verify QR code for booking (Driver only)"""
    
    # Check if user is a driver
    if Permission.PASSENGER_READ not in current_user.permissions:
        raise HTTPException(status_code=403, detail="Driver access required")
    
    try:
        booking = await booking_service.verify_booking_qr(
            qr_data=request.qr_data,
            driver_id=current_user.id
        )
        
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        return {
            "success": True,
            "message": "Booking verified successfully",
            "booking": booking.dict()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error verifying QR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{booking_id}/complete")
async def complete_booking(
    booking_id: str,
    current_user: User = Depends(get_current_user)
):
    """Mark booking as completed (Driver only)"""
    
    # Check if user is a driver
    if Permission.PASSENGER_READ not in current_user.permissions:
        raise HTTPException(status_code=403, detail="Driver access required")
    
    try:
        success = await booking_service.complete_booking(booking_id)
        
        if not success:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        return {
            "success": True,
            "message": "Booking completed"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error completing booking: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/bulk-booking")
async def create_bulk_booking(
    request: BulkBookingRequest,
    current_user: User = Depends(get_current_user)
):
    """Create bulk booking for corporate (Corporate Admin only)"""
    
    # Check if user has corporate admin permission
    if Permission.CORPORATE_MANAGE not in current_user.permissions:
        raise HTTPException(status_code=403, detail="Corporate admin access required")
    
    try:
        # Calculate total amount (mock calculation)
        # In production, this should be based on route pricing
        price_per_seat_per_day = 100  # INR
        total_amount = request.capacity * len(request.booking_dates) * price_per_seat_per_day
        
        bulk_booking = await booking_service.create_bulk_booking(
            company_id=current_user.company_id,
            corporate_admin_id=current_user.id,
            route_id=request.route_id,
            booking_dates=request.booking_dates,
            capacity=request.capacity,
            payment_type=request.payment_type,
            total_amount=total_amount,
            employee_ids=request.employee_ids
        )
        
        return {
            "success": True,
            "bulk_booking": bulk_booking.dict(),
            "total_amount": total_amount
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating bulk booking: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
