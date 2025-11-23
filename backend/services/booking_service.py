from typing import Optional, List
from models.payment import Booking, BookingStatus, BulkBooking
from database import db
from datetime import datetime, timezone
import qrcode
import io
import base64
import random
import logging

logger = logging.getLogger(__name__)

class BookingService:
    
    def generate_otp(self) -> str:
        """Generate 6-digit OTP"""
        return str(random.randint(100000, 999999))
    
    def generate_qr_code(self, data: str) -> str:
        """Generate QR code and return base64 encoded image"""
        
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(data)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert to base64
        buffered = io.BytesIO()
        img.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        
        return img_str
    
    async def create_booking(self, user_id: str, pass_id: Optional[str],
                            pickup_location: str, dropoff_location: str,
                            journey_date: datetime, shuttle_id: Optional[str] = None,
                            route_id: Optional[str] = None) -> Booking:
        """Create a new booking"""
        
        # Generate OTP and QR code
        otp = self.generate_otp()
        
        # QR data includes booking info
        qr_data = f"BOOKING|{user_id}|{journey_date.isoformat()}|{otp}"
        qr_code = self.generate_qr_code(qr_data)
        
        booking = Booking(
            user_id=user_id,
            pass_id=pass_id,
            shuttle_id=shuttle_id,
            route_id=route_id,
            pickup_location=pickup_location,
            dropoff_location=dropoff_location,
            booking_date=datetime.now(timezone.utc),
            journey_date=journey_date,
            otp=otp,
            qr_code=qr_code,
            qr_data=qr_data,
            status=BookingStatus.CONFIRMED
        )
        
        booking_dict = booking.dict()
        await db.bookings.insert_one(booking_dict)
        
        logger.info(f"Booking created: {booking.id} for user {user_id}")
        
        return booking
    
    async def get_booking(self, booking_id: str) -> Optional[Booking]:
        """Get booking by ID"""
        
        booking_data = await db.bookings.find_one({"id": booking_id})
        if booking_data:
            return Booking(**booking_data)
        return None
    
    async def get_user_bookings(self, user_id: str) -> List[Booking]:
        """Get all bookings for a user"""
        
        bookings_data = await db.bookings.find(
            {"user_id": user_id}
        ).sort("booking_date", -1).to_list(100)
        
        return [Booking(**b) for b in bookings_data]
    
    async def verify_booking_otp(self, booking_id: str, otp: str, driver_id: str) -> bool:
        """Verify OTP and mark booking as active"""
        
        booking = await self.get_booking(booking_id)
        if not booking:
            raise ValueError("Booking not found")
        
        if booking.otp != otp:
            return False
        
        # Mark as active and verified
        await db.bookings.update_one(
            {"id": booking_id},
            {
                "$set": {
                    "status": BookingStatus.ACTIVE.value,
                    "driver_id": driver_id,
                    "verified_at": datetime.now(timezone.utc)
                }
            }
        )
        
        return True
    
    async def verify_booking_qr(self, qr_data: str, driver_id: str) -> Optional[Booking]:
        """Verify QR code and mark booking as active"""
        
        # Find booking by QR data
        booking_data = await db.bookings.find_one({"qr_data": qr_data})
        if not booking_data:
            return None
        
        booking = Booking(**booking_data)
        
        # Check if already used
        if booking.status == BookingStatus.COMPLETED:
            raise ValueError("Booking already completed")
        
        # Mark as active and verified
        await db.bookings.update_one(
            {"id": booking.id},
            {
                "$set": {
                    "status": BookingStatus.ACTIVE.value,
                    "driver_id": driver_id,
                    "verified_at": datetime.now(timezone.utc)
                }
            }
        )
        
        return booking
    
    async def complete_booking(self, booking_id: str) -> bool:
        """Mark booking as completed"""
        
        result = await db.bookings.update_one(
            {"id": booking_id},
            {
                "$set": {
                    "status": BookingStatus.COMPLETED.value,
                    "completed_at": datetime.now(timezone.utc)
                }
            }
        )
        
        return result.modified_count > 0
    
    async def cancel_booking(self, booking_id: str) -> bool:
        """Cancel a booking"""
        
        result = await db.bookings.update_one(
            {"id": booking_id},
            {
                "$set": {
                    "status": BookingStatus.CANCELLED.value
                }
            }
        )
        
        return result.modified_count > 0
    
    async def create_bulk_booking(self, company_id: str, corporate_admin_id: str,
                                 route_id: str, booking_dates: List[datetime],
                                 capacity: int, payment_type: str,
                                 total_amount: float, employee_ids: List[str] = None) -> BulkBooking:
        """Create bulk booking for corporate"""
        
        bulk_booking = BulkBooking(
            company_id=company_id,
            corporate_admin_id=corporate_admin_id,
            route_id=route_id,
            booking_dates=booking_dates,
            capacity=capacity,
            payment_type=payment_type,
            total_amount=total_amount,
            employee_ids=employee_ids or [],
            status=BookingStatus.PENDING
        )
        
        bulk_booking_dict = bulk_booking.dict()
        # Convert datetime objects to ISO format strings for MongoDB
        bulk_booking_dict["booking_dates"] = [d.isoformat() for d in booking_dates]
        
        await db.bulk_bookings.insert_one(bulk_booking_dict)
        
        logger.info(f"Bulk booking created: {bulk_booking.id}")
        
        return bulk_booking
    
    async def get_bulk_booking(self, bulk_booking_id: str) -> Optional[BulkBooking]:
        """Get bulk booking by ID"""
        
        booking_data = await db.bulk_bookings.find_one({"id": bulk_booking_id})
        if booking_data:
            # Convert ISO strings back to datetime
            if "booking_dates" in booking_data:
                booking_data["booking_dates"] = [
                    datetime.fromisoformat(d) if isinstance(d, str) else d
                    for d in booking_data["booking_dates"]
                ]
            return BulkBooking(**booking_data)
        return None
    
    async def confirm_bulk_booking(self, bulk_booking_id: str, transaction_id: str) -> bool:
        """Confirm bulk booking after payment"""
        
        result = await db.bulk_bookings.update_one(
            {"id": bulk_booking_id},
            {
                "$set": {
                    "status": BookingStatus.CONFIRMED.value,
                    "transaction_id": transaction_id
                }
            }
        )
        
        return result.modified_count > 0

# Global booking service instance
booking_service = BookingService()
