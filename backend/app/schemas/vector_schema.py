from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class DatasetBase(BaseModel):
    """Base schema for a dataset"""
    name: str = Field(..., description="Dataset name")
    description: Optional[str] = Field(None, description="Dataset description")

class Dataset(DatasetBase):
    """Schema for a complete dataset"""
    id: int = Field(..., description="Database primary key")
    created_at: datetime = Field(..., description="When the dataset was created")
    
    class Config:
        from_attributes = True

class VectorBase(BaseModel):
    """Base schema for a vector"""
    embedding: List[float] = Field(..., description="Vector embedding")
    metadata: Optional[dict] = Field(None, description="Additional metadata")

class Vector(VectorBase):
    """Schema for a complete vector"""
    id: int = Field(..., description="Database primary key")
    dataset_id: int = Field(..., description="Associated dataset ID")
    dataset: Optional[Dataset] = Field(None, description="Associated dataset")
    created_at: datetime = Field(..., description="When the vector was created")
    
    class Config:
        from_attributes = True

class VectorResponse(BaseModel):
    """Schema for API vector response"""
    vector: Vector

class DatasetResponse(BaseModel):
    """Schema for API dataset response"""
    dataset: Dataset
    vector: Optional[Vector] = None

