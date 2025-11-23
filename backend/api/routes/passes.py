from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from services.pass_service import pass_service
from api.routes.auth import get_current_user
from models.rbac import User, Permission
from models.payment import SubscriptionPlanType
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/passes", tags=["Passes"])

class CreatePlanRequest(BaseModel):
    name: str
    type: SubscriptionPlanType
    validity_days: int
    number_of_passes: int
    price: float
    description: Optional[str] = None

class BulkPurchaseRequest(BaseModel):
    plan_id: str
    employee_ids: List[str]

@router.get("/plans")
async def get_subscription_plans(active_only: bool = True):
    """Get all subscription plans"""
    
    try:
        plans = await pass_service.get_all_plans(active_only=active_only)
        return {
            "plans": [plan.dict() for plan in plans]
        }
    except Exception as e:
        logger.error(f"Error fetching plans: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/plans")
async def create_subscription_plan(
    request: CreatePlanRequest,
    current_user: User = Depends(get_current_user)
):
    """Create a new subscription plan (Admin only)"""
    
    # Check if user has permission
    if Permission.SYSTEM_ADMIN not in current_user.permissions:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        plan = await pass_service.create_subscription_plan(
            name=request.name,
            plan_type=request.type,
            validity_days=request.validity_days,
            number_of_passes=request.number_of_passes,
            price=request.price,
            description=request.description
        )
        
        return {
            "success": True,
            "plan": plan.dict()
        }
        
    except Exception as e:
        logger.error(f"Error creating plan: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/my-passes")
async def get_my_passes(
    current_user: User = Depends(get_current_user),
    active_only: bool = True
):
    """Get all passes for current user"""
    
    try:
        passes = await pass_service.get_user_passes(
            user_id=current_user.id,
            active_only=active_only
        )
        
        return {
            "passes": [p.dict() for p in passes]
        }
        
    except Exception as e:
        logger.error(f"Error fetching passes: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{pass_id}")
async def get_pass_details(
    pass_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get pass details"""
    
    pass_obj = await pass_service.get_pass(pass_id)
    
    if not pass_obj:
        raise HTTPException(status_code=404, detail="Pass not found")
    
    # Check if user owns this pass or is admin
    if pass_obj.user_id != current_user.id and Permission.SYSTEM_ADMIN not in current_user.permissions:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return pass_obj.dict()

@router.post("/bulk-purchase")
async def bulk_purchase_passes(
    request: BulkPurchaseRequest,
    current_user: User = Depends(get_current_user)
):
    """Bulk purchase passes for employees (Corporate Admin only)"""
    
    # Check if user has corporate admin permission
    if Permission.CORPORATE_MANAGE not in current_user.permissions:
        raise HTTPException(status_code=403, detail="Corporate admin access required")
    
    try:
        # Get the plan to calculate total cost
        plan = await pass_service.get_plan(request.plan_id)
        if not plan:
            raise HTTPException(status_code=404, detail="Plan not found")
        
        # Create passes for all employees
        created_passes = await pass_service.bulk_purchase_passes(
            company_id=current_user.company_id,
            admin_id=current_user.id,
            plan_id=request.plan_id,
            employee_ids=request.employee_ids
        )
        
        total_cost = plan.price * len(created_passes)
        
        return {
            "success": True,
            "message": f"Created {len(created_passes)} passes",
            "passes": [p.dict() for p in created_passes],
            "total_cost": total_cost
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in bulk purchase: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
