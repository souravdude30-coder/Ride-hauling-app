"""
Initialize default subscription plans
Run this script once to populate the database with default plans
"""
import asyncio
from services.pass_service import pass_service
from models.payment import SubscriptionPlanType
from database import db

async def init_subscription_plans():
    """Create default subscription plans"""
    
    default_plans = [
        {
            "name": "Daily Pass",
            "type": SubscriptionPlanType.DAILY,
            "validity_days": 1,
            "number_of_passes": 2,  # 2 rides per day
            "price": 100.0,
            "description": "1 day validity, 2 rides included"
        },
        {
            "name": "Weekly Pass",
            "type": SubscriptionPlanType.WEEKLY,
            "validity_days": 7,
            "number_of_passes": 14,  # 2 rides per day
            "price": 600.0,
            "description": "7 days validity, 14 rides included"
        },
        {
            "name": "Monthly Basic",
            "type": SubscriptionPlanType.MONTHLY,
            "validity_days": 30,
            "number_of_passes": 30,  # 1 ride per day
            "price": 1500.0,
            "description": "30 days validity, 30 rides included"
        },
        {
            "name": "Monthly Premium",
            "type": SubscriptionPlanType.MONTHLY,
            "validity_days": 30,
            "number_of_passes": 60,  # 2 rides per day
            "price": 2500.0,
            "description": "30 days validity, 60 rides included"
        },
        {
            "name": "Quarterly Pass",
            "type": SubscriptionPlanType.QUARTERLY,
            "validity_days": 90,
            "number_of_passes": 180,  # 2 rides per day
            "price": 6500.0,
            "description": "90 days validity, 180 rides included"
        },
        {
            "name": "Annual Pass",
            "type": SubscriptionPlanType.ANNUAL,
            "validity_days": 365,
            "number_of_passes": 730,  # 2 rides per day
            "price": 25000.0,
            "description": "365 days validity, 730 rides included"
        },
    ]
    
    print("🚀 Initializing subscription plans...")
    print("-" * 50)
    
    for plan_data in default_plans:
        try:
            # Check if plan already exists
            existing = await db.subscription_plans.find_one({"name": plan_data["name"]})
            if existing:
                print(f"⚠️ Plan '{plan_data['name']}' already exists")
                continue
            
            plan = await pass_service.create_subscription_plan(
                name=plan_data["name"],
                plan_type=plan_data["type"],
                validity_days=plan_data["validity_days"],
                number_of_passes=plan_data["number_of_passes"],
                price=plan_data["price"],
                description=plan_data["description"]
            )
            print(f"✅ Created plan: {plan.name} - ₹{plan.price} ({plan.number_of_passes} rides)")
        except Exception as e:
            print(f"❌ Error creating plan '{plan_data['name']}': {str(e)}")
    
    print("-" * 50)
    print("✅ Subscription plans initialization complete!")

if __name__ == "__main__":
    asyncio.run(init_subscription_plans())
