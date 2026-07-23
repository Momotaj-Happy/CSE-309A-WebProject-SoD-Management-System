from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from api.models.user import UserResponse, UserUpdateRole, UserRole
from api.services.user_service import UserService
from api.services.auth_service import get_current_token_payload

router = APIRouter(tags=["Users"])


@router.get("/users/me", response_model=UserResponse)
def get_current_user(payload: dict = Depends(get_current_token_payload)):
    """Retrieves profile of the currently logged-in user."""
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    user = UserService.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.get("/users", response_model=List[UserResponse])
def list_users(
    role: Optional[str] = Query(None, description="Filter by role (STUDENT, FACULTY, LAB_MGR, DEPT_MGR)"),
    search: Optional[str] = Query(None, description="Search by name, email, or dept_id"),
    payload: dict = Depends(get_current_token_payload)
):
    """Lists all registered users with optional role and keyword search filtering."""
    return UserService.get_all(role_filter=role, search=search)


@router.patch("/admin/roles", response_model=UserResponse)
def update_user_role(
    update_data: UserUpdateRole,
    payload: dict = Depends(get_current_token_payload)
):
    """Updates a user's role. Restricted to LAB_MGR and DEPT_MGR roles."""
    current_role = payload.get("role")
    if current_role not in [UserRole.LAB_MGR, UserRole.DEPT_MGR]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden. Only Managers can update user roles."
        )

    updated_user = UserService.update_role(update_data.user_id, update_data.role)
    if not updated_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target user not found")
    
    return updated_user


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: str,
    payload: dict = Depends(get_current_token_payload)
):
    """Deletes a user account. Restricted to DEPT_MGR role."""
    current_role = payload.get("role")
    if current_role != UserRole.DEPT_MGR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden. Only Department Managers can delete users."
        )

    success = UserService.delete_user(user_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return None
