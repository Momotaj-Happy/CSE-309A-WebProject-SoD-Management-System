from fastapi import APIRouter, HTTPException, status
from api.models.user import UserCreate, UserLogin, TokenResponse, UserResponse
from api.services.user_service import UserService
from api.services.auth_service import verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate):
    """Registers a new user account."""
    if UserService.get_by_email(user_in.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )
    if UserService.get_by_dept_id(user_in.dept_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this Department ID already exists."
        )

    user_res = UserService.create_user(user_in)
    access_token = create_access_token(data={"sub": user_res.id, "role": user_res.role})
    return TokenResponse(access_token=access_token, token_type="bearer", user=user_res)


@router.post("/login", response_model=TokenResponse)
def login(credentials: UserLogin):
    """Authenticates user via email or Department ID and returns JWT token."""
    input_identifier = credentials.email_or_dept_id.strip()
    
    # Try finding by email or dept_id
    user = UserService.get_by_email(input_identifier)
    if not user:
        user = UserService.get_by_dept_id(input_identifier)

    if not user or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. Please check your Email/Department ID and password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_res = UserResponse(
        id=user["id"],
        dept_id=user["dept_id"],
        email=user["email"],
        full_name=user["full_name"],
        role=user["role"],
        created_at=user["created_at"]
    )
    access_token = create_access_token(data={"sub": user["id"], "role": user["role"]})
    return TokenResponse(access_token=access_token, token_type="bearer", user=user_res)
