from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional
from services.payment_service import payment_service
from services.pass_service import pass_service
from api.routes.auth import get_current_user
from models.rbac import User
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/payments", tags=["Payments"])

class CreateOrderRequest(BaseModel):
    amount: float
    description: str
    plan_id: Optional[str] = None

class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    plan_id: Optional[str] = None

@router.post("/create-order")
async def create_payment_order(
    request: CreateOrderRequest,
    current_user: User = Depends(get_current_user)
):
    """Create a Razorpay payment order"""
    
    try:
        order = await payment_service.create_order(
            amount=request.amount,
            user_id=current_user.id,
            description=request.description
        )
        
        return {
            "success": True,
            "order": order
        }
        
    except Exception as e:
        logger.error(f"Error creating order: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/verify-payment")
async def verify_payment(
    request: VerifyPaymentRequest,
    current_user: User = Depends(get_current_user)
):
    """Verify Razorpay payment and complete purchase"""
    
    try:
        # Verify payment
        is_valid = await payment_service.verify_payment(
            razorpay_order_id=request.razorpay_order_id,
            razorpay_payment_id=request.razorpay_payment_id,
            razorpay_signature=request.razorpay_signature
        )
        
        if not is_valid:
            raise HTTPException(status_code=400, detail="Payment verification failed")
        
        # If purchasing a pass, create it
        if request.plan_id:
            new_pass = await pass_service.purchase_pass(
                user_id=current_user.id,
                plan_id=request.plan_id
            )
            
            return {
                "success": True,
                "message": "Payment verified and pass created",
                "pass": new_pass.dict()
            }
        
        return {
            "success": True,
            "message": "Payment verified successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error verifying payment: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/transaction/{transaction_id}")
async def get_transaction(
    transaction_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get transaction details"""
    
    transaction = await payment_service.get_transaction(transaction_id)
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    # Check if user owns this transaction
    if transaction.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return transaction.dict()

@router.get("/razorpay-key")
async def get_razorpay_key():
    """Get Razorpay key for frontend"""
    
    return {
        "key_id": payment_service.key_id
    }
