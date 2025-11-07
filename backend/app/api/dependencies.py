from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.base import get_db
from typing import Generator


def get_database() -> Generator:
    """
    Dependency to get database session
    Usage: db: Session = Depends(get_database)
    """
    return get_db()


# Example: Authentication dependency (uncomment and customize as needed)
# def get_current_user(
#     token: str = Depends(oauth2_scheme),
#     db: Session = Depends(get_database)
# ):
#     """Dependency to get current authenticated user"""
#     credentials_exception = HTTPException(
#         status_code=status.HTTP_401_UNAUTHORIZED,
#         detail="Could not validate credentials",
#         headers={"WWW-Authenticate": "Bearer"},
#     )
#     # Add your authentication logic here
#     return user

