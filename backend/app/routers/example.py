from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.api.dependencies import get_database
from app.schemas.example import ExampleCreate, ExampleUpdate, ExampleResponse
from app.services.example_service import ExampleService

router = APIRouter()


@router.get("/", response_model=List[ExampleResponse])
async def get_examples(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_database)
):
    """Get all examples with pagination"""
    examples = ExampleService.get_examples(db, skip=skip, limit=limit)
    return examples


@router.get("/{example_id}", response_model=ExampleResponse)
async def get_example(
    example_id: int,
    db: Session = Depends(get_database)
):
    """Get a specific example by ID"""
    example = ExampleService.get_example(db, example_id=example_id)
    if not example:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Example with id {example_id} not found"
        )
    return example


@router.post("/", response_model=ExampleResponse, status_code=status.HTTP_201_CREATED)
async def create_example(
    example: ExampleCreate,
    db: Session = Depends(get_database)
):
    """Create a new example"""
    return ExampleService.create_example(db, example=example)


@router.put("/{example_id}", response_model=ExampleResponse)
async def update_example(
    example_id: int,
    example_update: ExampleUpdate,
    db: Session = Depends(get_database)
):
    """Update an existing example"""
    example = ExampleService.update_example(db, example_id=example_id, example_update=example_update)
    if not example:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Example with id {example_id} not found"
        )
    return example


@router.delete("/{example_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_example(
    example_id: int,
    db: Session = Depends(get_database)
):
    """Delete an example"""
    success = ExampleService.delete_example(db, example_id=example_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Example with id {example_id} not found"
        )
    return None

