from fastapi import APIRouter, Depends, HTTPException, status, Header
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from typing import Optional
from services.rbac_service import rbac_service
from models.rbac import User, UserRole
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# Request/Response Models
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: Optional[str] = None
    role: UserRole = UserRole.PASSENGER
    company_id: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    company_id: Optional[str]
    permissions: list
    is_active: bool

# Dependency to get current user from token
async def get_current_user(authorization: Optional[str] = Header(None)) -> User:
    """Extract and verify JWT token from Authorization header"""
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        # Extract token from "Bearer <token>"
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication scheme"
            )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format"
        )
    
    user = await rbac_service.verify_token(token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user

@router.post("/register", response_model=UserResponse)
async def register(request: RegisterRequest):
    """Register a new user"""
    try:
        # Create user with hashed password
        user = await rbac_service.create_user(
            email=request.email,
            password=request.password,
            name=request.name,
            role=request.role,
            company_id=request.company_id,
            phone=request.phone
        )
        
        return UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            role=user.role.value,
            company_id=user.company_id,
            permissions=list(user.permissions),
            is_active=user.is_active
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )

@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """Login user and return JWT token"""
    token = await rbac_service.authenticate_user(request.email, request.password)
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get user details
    user = await rbac_service.verify_token(token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token verification failed"
        )
    
    return LoginResponse(
        access_token=token,
        token_type="bearer",
        user={
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "role": user.role.value,
            "company_id": user.company_id,
            "permissions": list(user.permissions)
        }
    )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current authenticated user information"""
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        role=current_user.role.value,
        company_id=current_user.company_id,
        permissions=list(current_user.permissions),
        is_active=current_user.is_active
    )

@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """Logout user (client should discard token)"""
    # In a stateless JWT system, logout is handled client-side
    # For added security, you could maintain a token blacklist
    return {"message": "Logged out successfully"}

@router.get("/verify-token")
async def verify_token(current_user: User = Depends(get_current_user)):
    """Verify if token is valid"""
    return {
        "valid": True,
        "user_id": current_user.id,
        "role": current_user.role.value
    }
