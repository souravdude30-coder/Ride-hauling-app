from pydantic import BaseModel, Field, EmailStr
from typing import List, Dict, Optional, Set
from datetime import datetime, timezone
from enum import Enum
import uuid

class UserRole(str, Enum):
    MASTER_ADMIN = "master_admin"
    FLEET_MANAGER = "fleet_manager"
    CORPORATE_ADMIN = "corporate_admin"
    DRIVER = "driver"
    PASSENGER = "passenger"
    PARENT = "parent"

class Permission(str, Enum):
    # System-wide permissions
    SYSTEM_ADMIN = "system:admin"
    SYSTEM_READ = "system:read"
    
    # Fleet management permissions
    FLEET_MANAGE = "fleet:manage"
    FLEET_READ = "fleet:read"
    FLEET_ANALYTICS = "fleet:analytics"
    
    # Driver management permissions
    DRIVER_MANAGE = "driver:manage"
    DRIVER_READ = "driver:read"
    DRIVER_ASSIGN = "driver:assign"
    
    # Vehicle management permissions
    VEHICLE_MANAGE = "vehicle:manage"
    VEHICLE_READ = "vehicle:read"
    VEHICLE_TRACK = "vehicle:track"
    
    # Route management permissions
    ROUTE_MANAGE = "route:manage"
    ROUTE_READ = "route:read"
    ROUTE_OPTIMIZE = "route:optimize"
    
    # Passenger management permissions
    PASSENGER_MANAGE = "passenger:manage"
    PASSENGER_READ = "passenger:read"
    PASSENGER_TRACK = "passenger:track"
    
    # Corporate permissions
    CORPORATE_MANAGE = "corporate:manage"
    CORPORATE_READ = "corporate:read"
    CORPORATE_ANALYTICS = "corporate:analytics"
    
    # Emergency and safety permissions
    EMERGENCY_MANAGE = "emergency:manage"
    EMERGENCY_RESPOND = "emergency:respond"
    SOS_ACCESS = "sos:access"
    
    # Communication permissions
    COMMUNICATE_ALL = "communicate:all"
    COMMUNICATE_ASSIGNED = "communicate:assigned"
    
    # Audit and logging permissions
    AUDIT_READ = "audit:read"
    LOGS_READ = "logs:read"

class RoleDefinition(BaseModel):
    role: UserRole
    permissions: Set[Permission]
    description: str
    hierarchy_level: int  # Higher number = more privileges

# Predefined role configurations
ROLE_PERMISSIONS = {
    UserRole.MASTER_ADMIN: RoleDefinition(
        role=UserRole.MASTER_ADMIN,
        permissions={
            Permission.SYSTEM_ADMIN, Permission.SYSTEM_READ,
            Permission.FLEET_MANAGE, Permission.FLEET_READ, Permission.FLEET_ANALYTICS,
            Permission.DRIVER_MANAGE, Permission.DRIVER_READ, Permission.DRIVER_ASSIGN,
            Permission.VEHICLE_MANAGE, Permission.VEHICLE_READ, Permission.VEHICLE_TRACK,
            Permission.ROUTE_MANAGE, Permission.ROUTE_READ, Permission.ROUTE_OPTIMIZE,
            Permission.PASSENGER_MANAGE, Permission.PASSENGER_READ, Permission.PASSENGER_TRACK,
            Permission.CORPORATE_MANAGE, Permission.CORPORATE_READ, Permission.CORPORATE_ANALYTICS,
            Permission.EMERGENCY_MANAGE, Permission.EMERGENCY_RESPOND, Permission.SOS_ACCESS,
            Permission.COMMUNICATE_ALL, Permission.AUDIT_READ, Permission.LOGS_READ
        },
        description="Full system access - can manage all aspects of the platform",
        hierarchy_level=100
    ),
    
    UserRole.FLEET_MANAGER: RoleDefinition(
        role=UserRole.FLEET_MANAGER,
        permissions={
            Permission.FLEET_READ, Permission.FLEET_ANALYTICS,
            Permission.DRIVER_MANAGE, Permission.DRIVER_READ, Permission.DRIVER_ASSIGN,
            Permission.VEHICLE_MANAGE, Permission.VEHICLE_READ, Permission.VEHICLE_TRACK,
            Permission.ROUTE_MANAGE, Permission.ROUTE_READ, Permission.ROUTE_OPTIMIZE,
            Permission.PASSENGER_READ, Permission.PASSENGER_TRACK,
            Permission.EMERGENCY_RESPOND, Permission.SOS_ACCESS,
            Permission.COMMUNICATE_ASSIGNED, Permission.AUDIT_READ
        },
        description="Manages fleet operations, drivers, and routes",
        hierarchy_level=80
    ),
    
    UserRole.CORPORATE_ADMIN: RoleDefinition(
        role=UserRole.CORPORATE_ADMIN,
        permissions={
            Permission.CORPORATE_READ, Permission.CORPORATE_ANALYTICS,
            Permission.PASSENGER_MANAGE, Permission.PASSENGER_READ, Permission.PASSENGER_TRACK,
            Permission.ROUTE_READ, Permission.VEHICLE_READ, Permission.VEHICLE_TRACK,
            Permission.DRIVER_READ, Permission.EMERGENCY_RESPOND, Permission.SOS_ACCESS,
            Permission.COMMUNICATE_ASSIGNED
        },
        description="Manages corporate shuttle services for their organization",
        hierarchy_level=60
    ),
    
    UserRole.DRIVER: RoleDefinition(
        role=UserRole.DRIVER,
        permissions={
            Permission.ROUTE_READ, Permission.PASSENGER_READ, Permission.PASSENGER_TRACK,
            Permission.VEHICLE_READ, Permission.EMERGENCY_RESPOND, Permission.SOS_ACCESS,
            Permission.COMMUNICATE_ASSIGNED
        },
        description="Accesses route information and passenger manifests",
        hierarchy_level=40
    ),
    
    UserRole.PASSENGER: RoleDefinition(
        role=UserRole.PASSENGER,
        permissions={
            Permission.VEHICLE_TRACK, Permission.SOS_ACCESS
        },
        description="Can track their rides and use emergency features",
        hierarchy_level=20
    ),
    
    UserRole.PARENT: RoleDefinition(
        role=UserRole.PARENT,
        permissions={
            Permission.PASSENGER_TRACK, Permission.VEHICLE_TRACK, Permission.SOS_ACCESS,
            Permission.COMMUNICATE_ASSIGNED
        },
        description="Can track their children's rides and communicate with drivers",
        hierarchy_level=30
    )
}

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    phone: Optional[str] = None
    role: UserRole
    company_id: Optional[str] = None  # For corporate users
    permissions: Set[Permission] = Field(default_factory=set)
    password_hash: Optional[str] = None  # Not returned in API responses
    is_active: bool = True
    last_login: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    def has_permission(self, permission: Permission) -> bool:
        """Check if user has specific permission"""
        return permission in self.permissions
    
    def can_access_resource(self, resource_type: str, resource_id: str = None) -> bool:
        """Check if user can access a specific resource"""
        # Implement resource-level access control
        if self.role == UserRole.MASTER_ADMIN:
            return True
        
        if resource_type == "company" and self.company_id:
            return resource_id == self.company_id or resource_id is None
        
        return False

class Company(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    domain: str  # email domain for automatic role assignment
    admin_emails: List[str] = []
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AuditLog(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    action: str
    resource_type: str
    resource_id: Optional[str] = None
    details: Dict = {}
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class SessionToken(BaseModel):
    token: str
    user_id: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True

class EmergencyContact(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    phone: str
    relationship: str
    is_primary: bool = False

class SafetyFeature(BaseModel):
    sos_enabled: bool = True
    emergency_contacts: List[EmergencyContact] = []
    smart_card_id: Optional[str] = None
    qr_code: Optional[str] = None
    verification_method: str = "qr_code"  # qr_code, smart_card, biometric