import razorpay
import os
from typing import Optional, Dict
from models.payment import Transaction, PaymentStatus
from database import db
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

class PaymentService:
    def __init__(self):
        # Use placeholder keys for now, will be replaced with actual keys
        self.key_id = os.environ.get('RAZORPAY_KEY_ID', 'rzp_test_placeholder')
        self.key_secret = os.environ.get('RAZORPAY_KEY_SECRET', 'placeholder_secret')
        self.webhook_secret = os.environ.get('RAZORPAY_WEBHOOK_SECRET', 'webhook_secret')
        
        try:
            self.client = razorpay.Client(auth=(self.key_id, self.key_secret))
        except Exception as e:
            logger.warning(f"Razorpay client initialization failed: {e}. Using mock mode.")
            self.client = None
    
    async def create_order(self, amount: float, currency: str = "INR", 
                          user_id: str = None, description: str = "") -> Dict:
        """Create a Razorpay order for payment"""
        
        amount_paise = int(amount * 100)  # Convert to paise
        
        # Create transaction record
        transaction = Transaction(
            user_id=user_id,
            amount=amount,
            currency=currency,
            description=description,
            status=PaymentStatus.PENDING
        )
        
        try:
            if self.client:
                # Create Razorpay order
                razorpay_order = self.client.order.create({
                    "amount": amount_paise,
                    "currency": currency,
                    "payment_capture": 1  # Auto capture
                })
                
                transaction.razorpay_order_id = razorpay_order["id"]
            else:
                # Mock mode for development
                transaction.razorpay_order_id = f"order_mock_{transaction.id}"
                razorpay_order = {
                    "id": transaction.razorpay_order_id,
                    "amount": amount_paise,
                    "currency": currency
                }
            
            # Save transaction to database
            transaction_dict = transaction.dict()
            await db.transactions.insert_one(transaction_dict)
            
            return {
                "order_id": razorpay_order["id"],
                "amount": amount_paise,
                "currency": currency,
                "key_id": self.key_id,
                "transaction_id": transaction.id
            }
            
        except Exception as e:
            logger.error(f"Error creating order: {str(e)}")
            raise Exception(f"Failed to create payment order: {str(e)}")
    
    async def verify_payment(self, razorpay_order_id: str, razorpay_payment_id: str, 
                           razorpay_signature: str) -> bool:
        """Verify Razorpay payment signature"""
        
        try:
            if self.client:
                # Verify signature
                params_dict = {
                    'razorpay_order_id': razorpay_order_id,
                    'razorpay_payment_id': razorpay_payment_id,
                    'razorpay_signature': razorpay_signature
                }
                
                self.client.utility.verify_payment_signature(params_dict)
            
            # Update transaction status
            await db.transactions.update_one(
                {"razorpay_order_id": razorpay_order_id},
                {
                    "$set": {
                        "razorpay_payment_id": razorpay_payment_id,
                        "razorpay_signature": razorpay_signature,
                        "status": PaymentStatus.COMPLETED.value,
                        "updated_at": datetime.now(timezone.utc)
                    }
                }
            )
            
            return True
            
        except Exception as e:
            logger.error(f"Payment verification failed: {str(e)}")
            
            # Update transaction as failed
            await db.transactions.update_one(
                {"razorpay_order_id": razorpay_order_id},
                {
                    "$set": {
                        "status": PaymentStatus.FAILED.value,
                        "updated_at": datetime.now(timezone.utc)
                    }
                }
            )
            
            return False
    
    async def get_transaction(self, transaction_id: str) -> Optional[Transaction]:
        """Get transaction by ID"""
        transaction_data = await db.transactions.find_one({"id": transaction_id})
        if transaction_data:
            return Transaction(**transaction_data)
        return None
    
    async def refund_payment(self, payment_id: str, amount: Optional[float] = None) -> Dict:
        """Initiate refund for a payment"""
        
        try:
            if self.client:
                refund_data = {"payment_id": payment_id}
                if amount:
                    refund_data["amount"] = int(amount * 100)  # Convert to paise
                
                refund = self.client.payment.refund(payment_id, refund_data)
                
                # Update transaction status
                await db.transactions.update_one(
                    {"razorpay_payment_id": payment_id},
                    {
                        "$set": {
                            "status": PaymentStatus.REFUNDED.value,
                            "updated_at": datetime.now(timezone.utc)
                        }
                    }
                )
                
                return refund
            else:
                # Mock refund
                return {"id": f"rfnd_mock_{payment_id}", "status": "processed"}
                
        except Exception as e:
            logger.error(f"Refund failed: {str(e)}")
            raise Exception(f"Failed to process refund: {str(e)}")

# Global payment service instance
payment_service = PaymentService()
