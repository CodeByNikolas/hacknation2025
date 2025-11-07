from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.sql import func
from app.database.base import Base


class BaseModel(Base):
    """Base model with common fields"""
    __abstract__ = True
    
    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


# Example model - replace with your actual models
class Example(BaseModel):
    """Example model"""
    __tablename__ = "examples"
    
    name = Column(String, index=True)
    description = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)

