from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional


class ExampleBase(BaseModel):
    """Base schema for Example"""
    name: str
    description: Optional[str] = None
    is_active: bool = True


class ExampleCreate(ExampleBase):
    """Schema for creating an Example"""
    pass


class ExampleUpdate(BaseModel):
    """Schema for updating an Example"""
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class ExampleResponse(ExampleBase):
    """Schema for Example response"""
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)

