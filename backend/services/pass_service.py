from typing import Optional, List
from models.payment import Pass, SubscriptionPlan, SubscriptionPlanType, PassAssignment
from database import db
from datetime import datetime, timedelta, timezone
import logging

logger = logging.getLogger(__name__)

class PassService:
    
    async def create_subscription_plan(self, name: str, plan_type: SubscriptionPlanType,
                                      validity_days: int, number_of_passes: int, 
                                      price: float, description: str = None) -> SubscriptionPlan:
        """Create a new subscription plan"""
        
        plan = SubscriptionPlan(
            name=name,
            type=plan_type,
            validity_days=validity_days,
            number_of_passes=number_of_passes,
            price=price,
            description=description
        )
        
        plan_dict = plan.dict()
        await db.subscription_plans.insert_one(plan_dict)
        
        return plan
    
    async def get_all_plans(self, active_only: bool = True) -> List[SubscriptionPlan]:
        """Get all subscription plans"""
        
        query = {"is_active": True} if active_only else {}
        plans_data = await db.subscription_plans.find(query).to_list(100)
        
        return [SubscriptionPlan(**plan) for plan in plans_data]
    
    async def get_plan(self, plan_id: str) -> Optional[SubscriptionPlan]:
        """Get subscription plan by ID"""
        
        plan_data = await db.subscription_plans.find_one({"id": plan_id})
        if plan_data:
            return SubscriptionPlan(**plan_data)
        return None
    
    async def purchase_pass(self, user_id: str, plan_id: str, 
                           purchased_by: Optional[str] = None) -> Pass:
        """Purchase a pass for a user"""
        
        # Get the plan
        plan = await self.get_plan(plan_id)
        if not plan:
            raise ValueError(f"Plan {plan_id} not found")
        
        # Create pass
        valid_from = datetime.now(timezone.utc)
        valid_until = valid_from + timedelta(days=plan.validity_days)
        
        new_pass = Pass(
            user_id=user_id,
            plan_id=plan.id,
            plan_name=plan.name,
            total_passes=plan.number_of_passes,
            remaining_passes=plan.number_of_passes,
            valid_from=valid_from,
            valid_until=valid_until,
            purchased_by=purchased_by
        )
        
        pass_dict = new_pass.dict()
        await db.passes.insert_one(pass_dict)
        
        logger.info(f"Pass created for user {user_id}: {new_pass.id}")
        
        return new_pass
    
    async def get_user_passes(self, user_id: str, active_only: bool = True) -> List[Pass]:
        """Get all passes for a user"""
        
        query = {"user_id": user_id}
        if active_only:
            query["is_active"] = True
            # Use a more lenient query for valid_until to avoid timezone issues
            query["remaining_passes"] = {"$gt": 0}
        
        passes_data = await db.passes.find(query).to_list(100)
        
        return [Pass(**p) for p in passes_data]
    
    async def get_pass(self, pass_id: str) -> Optional[Pass]:
        """Get pass by ID"""
        
        pass_data = await db.passes.find_one({"id": pass_id})
        if pass_data:
            return Pass(**pass_data)
        return None
    
    async def use_pass(self, pass_id: str) -> bool:
        """Use one journey from a pass"""
        
        pass_obj = await self.get_pass(pass_id)
        if not pass_obj:
            raise ValueError("Pass not found")
        
        if not pass_obj.is_active:
            raise ValueError("Pass is not active")
        
        # Ensure both datetimes are timezone-aware for comparison
        valid_until = pass_obj.valid_until
        if valid_until.tzinfo is None:
            valid_until = valid_until.replace(tzinfo=timezone.utc)
        
        if valid_until < datetime.now(timezone.utc):
            raise ValueError("Pass has expired")
        
        if pass_obj.remaining_passes <= 0:
            raise ValueError("No passes remaining")
        
        # Decrement remaining passes
        result = await db.passes.update_one(
            {"id": pass_id},
            {"$inc": {"remaining_passes": -1}}
        )
        
        # Deactivate if no passes left
        if pass_obj.remaining_passes - 1 <= 0:
            await db.passes.update_one(
                {"id": pass_id},
                {"$set": {"is_active": False}}
            )
        
        return result.modified_count > 0
    
    async def bulk_purchase_passes(self, company_id: str, admin_id: str, 
                                  plan_id: str, employee_ids: List[str]) -> List[Pass]:
        """Purchase passes in bulk for employees"""
        
        created_passes = []
        
        for employee_id in employee_ids:
            try:
                new_pass = await self.purchase_pass(
                    user_id=employee_id,
                    plan_id=plan_id,
                    purchased_by=admin_id
                )
                created_passes.append(new_pass)
            except Exception as e:
                logger.error(f"Failed to create pass for employee {employee_id}: {str(e)}")
        
        return created_passes
    
    async def assign_pass_to_employee(self, bulk_booking_id: str, employee_id: str,
                                     pass_id: str, assigned_by: str) -> PassAssignment:
        """Assign a pass from bulk booking to an employee"""
        
        assignment = PassAssignment(
            bulk_booking_id=bulk_booking_id,
            employee_id=employee_id,
            pass_id=pass_id,
            assigned_by=assigned_by
        )
        
        assignment_dict = assignment.dict()
        await db.pass_assignments.insert_one(assignment_dict)
        
        return assignment

# Global pass service instance
pass_service = PassService()
