"""
Initialize test users for all roles in the system
Run this script once to populate the database with test users
"""
import asyncio
import sys
from services.rbac_service import rbac_service
from models.rbac import UserRole
from database import db

async def init_test_users():
    """Create test users for each role"""
    
    test_users = [
        {
            "email": "admin@metrohail.com",
            "password": "Admin@123",
            "name": "Master Admin",
            "role": UserRole.MASTER_ADMIN,
            "phone": "+91-9999999999"
        },
        {
            "email": "fleet@company.com",
            "password": "Fleet@123",
            "name": "Fleet Manager",
            "role": UserRole.FLEET_MANAGER,
            "phone": "+91-9999999998"
        },
        {
            "email": "corporate@techcorp.com",
            "password": "Corp@123",
            "name": "Corporate Admin",
            "role": UserRole.CORPORATE_ADMIN,
            "phone": "+91-9999999997"
        },
        {
            "email": "driver@metrohail.com",
            "password": "Driver@123",
            "name": "Test Driver",
            "role": UserRole.DRIVER,
            "phone": "+91-9999999996"
        },
        {
            "email": "passenger@gmail.com",
            "password": "Pass@123",
            "name": "Test Passenger",
            "role": UserRole.PASSENGER,
            "phone": "+91-9999999995"
        },
        {
            "email": "parent@gmail.com",
            "password": "Parent@123",
            "name": "Test Parent",
            "role": UserRole.PARENT,
            "phone": "+91-9999999994"
        }
    ]
    
    print("🚀 Initializing test users...")
    print("-" * 50)
    
    # First, create a test company for corporate users
    try:
        company = await rbac_service.create_company(
            name="TechCorp",
            domain="techcorp.com",
            admin_emails=["corporate@techcorp.com"]
        )
        print(f"✅ Created company: {company.name}")
    except Exception as e:
        print(f"⚠️ Company may already exist: {str(e)}")
    
    # Create users
    for user_data in test_users:
        try:
            user = await rbac_service.create_user(
                email=user_data["email"],
                password=user_data["password"],
                name=user_data["name"],
                role=user_data["role"],
                phone=user_data.get("phone")
            )
            print(f"✅ Created user: {user.email} ({user.role.value})")
        except ValueError as e:
            print(f"⚠️ User {user_data['email']} may already exist: {str(e)}")
        except Exception as e:
            print(f"❌ Error creating user {user_data['email']}: {str(e)}")
    
    print("-" * 50)
    print("✅ User initialization complete!")
    print("\nTest Credentials:")
    print("-" * 50)
    for user_data in test_users:
        print(f"Role: {user_data['role'].value:20} | Email: {user_data['email']:25} | Password: {user_data['password']}")
    print("-" * 50)

if __name__ == "__main__":
    asyncio.run(init_test_users())
