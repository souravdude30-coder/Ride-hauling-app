from typing import Optional, List, Set
from models.rbac import User, UserRole, Permission, ROLE_PERMISSIONS, AuditLog, Company
from database import db
import jwt
import hashlib
from datetime import datetime, timedelta, timezone
import os
from passlib.context import CryptContext

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class RBACService:
    def __init__(self):
        self.secret_key = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-change-in-production-12345')
    
    def hash_password(self, password: str) -> str:
        """Hash a password using bcrypt"""
        return pwd_context.hash(password)
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        return pwd_context.verify(plain_password, hashed_password)
    
    async def create_user(self, email: str, name: str, role: UserRole, password: str,
                         company_id: Optional[str] = None, phone: Optional[str] = None) -> User:
        """Create a new user with role-based permissions"""
        
        # Check if user already exists
        existing_user = await db.users.find_one({"email": email})
        if existing_user:
            raise ValueError(f"User with email {email} already exists")
        
        # Get permissions for role
        role_def = ROLE_PERMISSIONS.get(role)
        if not role_def:
            raise ValueError(f"Invalid role: {role}")
        
        # Auto-assign company for corporate users
        if not company_id and "@" in email:
            domain = email.split("@")[1]
            company = await db.companies.find_one({"domain": domain})
            if company:
                company_id = company["id"]
                # Auto-promote to corporate admin if in admin list
                if email in company.get("admin_emails", []):
                    role = UserRole.CORPORATE_ADMIN
                    role_def = ROLE_PERMISSIONS[role]
        
        user = User(
            email=email,
            name=name,
            role=role,
            company_id=company_id,
            phone=phone,
            permissions=role_def.permissions
        )
        
        # Save to database with hashed password
        user_dict = user.dict()
        user_dict["permissions"] = list(user_dict["permissions"])  # Convert set to list for MongoDB
        user_dict["password_hash"] = self.hash_password(password)  # Store hashed password
        await db.users.insert_one(user_dict)
        
        # Log user creation
        await self.log_action(
            user_id="system",
            action="user_created",
            resource_type="user",
            resource_id=user.id,
            details={"email": email, "role": role.value, "company_id": company_id}
        )
        
        return user
    
    async def authenticate_user(self, email: str, password: str) -> Optional[str]:
        """Authenticate user and return JWT token"""
        user_data = await db.users.find_one({"email": email, "is_active": True})
        
        if not user_data:
            return None
        
        # Verify password
        if not self.verify_password(password, user_data.get("password_hash", "")):
            return None
        
        # Update last login
        await db.users.update_one(
            {"email": email},
            {"$set": {"last_login": datetime.now(timezone.utc)}}
        )
        
        # Create JWT token
        payload = {
            "user_id": user_data["id"],
            "email": user_data["email"],
            "role": user_data["role"],
            "company_id": user_data.get("company_id"),
            "permissions": user_data["permissions"],
            "exp": datetime.now(timezone.utc) + timedelta(hours=24)
        }
        
        token = jwt.encode(payload, self.secret_key, algorithm="HS256")
        
        # Log login
        await self.log_action(
            user_id=user_data["id"],
            action="user_login",
            resource_type="auth",
            details={"email": email}
        )
        
        return token
    
    async def verify_token(self, token: str) -> Optional[User]:
        """Verify JWT token and return user"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=["HS256"])
            user_data = await db.users.find_one({"id": payload["user_id"], "is_active": True})
            
            if not user_data:
                return None
            
            # Convert permissions list back to set
            user_data["permissions"] = set(user_data["permissions"])
            return User(**user_data)
            
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None
    
    async def check_permission(self, user: User, permission: Permission, 
                              resource_type: str = None, resource_id: str = None) -> bool:
        """Check if user has permission for specific resource"""
        
        # Check basic permission
        if not user.has_permission(permission):
            return False
        
        # Apply additional resource-level checks
        if resource_type == "company":
            # Users can only access their own company data
            if user.role not in [UserRole.MASTER_ADMIN] and user.company_id != resource_id:
                return False
        
        elif resource_type == "driver":
            # Corporate admins can only manage drivers in their company
            if user.role == UserRole.CORPORATE_ADMIN:
                driver_data = await db.drivers.find_one({"id": resource_id})
                if driver_data and driver_data.get("company_id") != user.company_id:
                    return False
        
        elif resource_type == "passenger":
            # Parents can only access their own children's data
            if user.role == UserRole.PARENT:
                passenger_data = await db.passengers.find_one({"id": resource_id})
                if passenger_data and user.id not in passenger_data.get("parent_ids", []):
                    return False
        
        return True
    
    async def get_accessible_resources(self, user: User, resource_type: str) -> List[str]:
        """Get list of resource IDs user can access"""
        accessible_ids = []
        
        if user.role == UserRole.MASTER_ADMIN:
            # Master admin can access all resources
            resources = await db[resource_type].find({"is_active": True}).to_list(1000)
            return [r["id"] for r in resources]
        
        elif resource_type == "companies" and user.company_id:
            # Users can access their own company
            accessible_ids = [user.company_id]
        
        elif resource_type == "drivers" and user.company_id:
            # Corporate admins can access drivers in their company
            if user.role in [UserRole.CORPORATE_ADMIN, UserRole.FLEET_MANAGER]:
                drivers = await db.drivers.find({"company_id": user.company_id}).to_list(1000)
                accessible_ids = [d["id"] for d in drivers]
        
        elif resource_type == "passengers":
            if user.role == UserRole.PARENT:
                # Parents can access their children
                passengers = await db.passengers.find({"parent_ids": user.id}).to_list(1000)
                accessible_ids = [p["id"] for p in passengers]
            elif user.company_id:
                # Corporate users can access company passengers
                passengers = await db.passengers.find({"company_id": user.company_id}).to_list(1000)
                accessible_ids = [p["id"] for p in passengers]
        
        return accessible_ids
    
    async def log_action(self, user_id: str, action: str, resource_type: str,
                        resource_id: str = None, details: dict = None, 
                        ip_address: str = None, user_agent: str = None):
        """Log user action for audit trail"""
        
        audit_log = AuditLog(
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            details=details or {},
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        await db.audit_logs.insert_one(audit_log.dict())
    
    async def create_company(self, name: str, domain: str, admin_emails: List[str] = None) -> Company:
        """Create a new company"""
        
        company = Company(
            name=name,
            domain=domain,
            admin_emails=admin_emails or []
        )
        
        await db.companies.insert_one(company.dict())
        return company
    
    async def assign_role(self, user_id: str, new_role: UserRole, assigner_user_id: str):
        """Assign new role to user (with hierarchy check)"""
        
        # Get assigner's role
        assigner = await db.users.find_one({"id": assigner_user_id})
        if not assigner:
            raise ValueError("Assigner not found")
        
        assigner_level = ROLE_PERMISSIONS[UserRole(assigner["role"])].hierarchy_level
        new_role_level = ROLE_PERMISSIONS[new_role].hierarchy_level
        
        # Check if assigner can assign this role (can't assign higher than their own)
        if new_role_level >= assigner_level:
            raise ValueError("Cannot assign role with equal or higher privileges")
        
        # Update user role and permissions
        new_permissions = list(ROLE_PERMISSIONS[new_role].permissions)
        
        await db.users.update_one(
            {"id": user_id},
            {
                "$set": {
                    "role": new_role.value,
                    "permissions": new_permissions,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        # Log role change
        await self.log_action(
            user_id=assigner_user_id,
            action="role_assigned",
            resource_type="user",
            resource_id=user_id,
            details={"new_role": new_role.value, "assigner_id": assigner_user_id}
        )

# Global RBAC service instance
rbac_service = RBACService()