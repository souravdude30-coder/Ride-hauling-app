from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime, timezone
from enum import Enum
import uuid

class PaymentMethod(str, Enum):
    UPI = "upi"
    CARD = "card"
    NETBANKING = "netbanking"
    WALLET = "wallet"

class PaymentStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"

class SubscriptionPlanType(str, Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    ANNUAL = "annual"

class BookingStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    EXPIRED = "expired"

class SubscriptionPlan(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    type: SubscriptionPlanType
    validity_days: int
    number_of_passes: int  # Number of journeys included
    price: float  # In INR
    description: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
class Pass(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    plan_id: str
    plan_name: str
    total_passes: int  # Total number of journeys
    remaining_passes: int  # Remaining journeys
    valid_from: datetime
    valid_until: datetime
    is_active: bool = True
    purchased_by: Optional[str] = None  # Corporate admin ID if bulk purchase
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Transaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    amount: float
    currency: str = "INR"
    payment_method: Optional[PaymentMethod] = None
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    razorpay_signature: Optional[str] = None
    status: PaymentStatus = PaymentStatus.PENDING
    description: str
    metadata: Dict = {}
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Booking(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    pass_id: Optional[str] = None  # If using a pass
    shuttle_id: Optional[str] = None
    route_id: Optional[str] = None
    pickup_location: str
    dropoff_location: str
    booking_date: datetime
    journey_date: datetime
    otp: str  # 6-digit OTP for verification
    qr_code: str  # Base64 encoded QR code image
    qr_data: str  # Data embedded in QR code
    status: BookingStatus = BookingStatus.PENDING
    driver_id: Optional[str] = None
    verified_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BulkBooking(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company_id: str
    corporate_admin_id: str
    shuttle_id: Optional[str] = None
    route_id: str
    booking_dates: List[datetime]  # Multiple dates for bulk booking
    capacity: int  # Number of seats to book
    payment_type: str  # "upfront" or "invoice"
    total_amount: float
    transaction_id: Optional[str] = None
    status: BookingStatus = BookingStatus.PENDING
    employee_ids: List[str] = []  # Assigned employees
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PassAssignment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    bulk_booking_id: str
    employee_id: str
    pass_id: str
    assigned_by: str  # Corporate admin ID
    assigned_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
