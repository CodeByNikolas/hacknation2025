from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ScrapeHistoryBase(BaseModel):
    """Base schema for scrape history"""
    status: str = Field(..., description="Scrape status: running, completed, or failed")
    markets_fetched: int = Field(default=0, description="Number of markets fetched from API")
    markets_added: int = Field(default=0, description="Number of new markets added to database")
    markets_updated: int = Field(default=0, description="Number of existing markets updated")
    markets_failed: int = Field(default=0, description="Number of markets that failed to import")
    error_message: Optional[str] = Field(None, description="Error message if scrape failed")
    instance_id: Optional[str] = Field(None, description="Identifier of the instance that ran the scrape")
    duration_seconds: Optional[float] = Field(None, description="Duration of the scrape in seconds")

class ScrapeHistoryCreate(BaseModel):
    """Schema for creating a scrape history record"""
    status: str = Field(default="running", description="Initial status")
    instance_id: Optional[str] = Field(None, description="Instance identifier")

class ScrapeHistoryUpdate(BaseModel):
    """Schema for updating a scrape history record"""
    status: Optional[str] = None
    completed_at: Optional[datetime] = None
    markets_fetched: Optional[int] = None
    markets_added: Optional[int] = None
    markets_updated: Optional[int] = None
    markets_failed: Optional[int] = None
    error_message: Optional[str] = None
    duration_seconds: Optional[float] = None

class ScrapeHistory(ScrapeHistoryBase):
    """Schema for a complete scrape history record"""
    id: int = Field(..., description="Database primary key")
    started_at: datetime = Field(..., description="When the scrape started")
    completed_at: Optional[datetime] = Field(None, description="When the scrape completed")
    created_at: datetime = Field(..., description="Record creation timestamp")

    class Config:
        from_attributes = True

class ScrapeHistoryResponse(BaseModel):
    """Schema for API scrape history response"""
    scrape: ScrapeHistory

class ScrapeHistoryListResponse(BaseModel):
    """Schema for API scrape history list response"""
    scrapes: list[ScrapeHistory]
    total: int

class ScrapeStatistics(BaseModel):
    """Schema for scrape statistics"""
    total_scrapes: int = Field(..., description="Total number of scrapes")
    successful_scrapes: int = Field(..., description="Number of successful scrapes")
    failed_scrapes: int = Field(..., description="Number of failed scrapes")
    last_scrape_time: Optional[datetime] = Field(None, description="Time of last scrape")
    last_scrape_status: Optional[str] = Field(None, description="Status of last scrape")
    average_duration_seconds: Optional[float] = Field(None, description="Average scrape duration")
    total_markets_tracked: int = Field(..., description="Total markets in database")

class ShouldRunScrapeResponse(BaseModel):
    """Schema for should_run_scrape check response"""
    should_run: bool = Field(..., description="Whether a new scrape should run")
    last_scrape_time: Optional[datetime] = Field(None, description="Time of last scrape")
    last_scrape_status: Optional[str] = Field(None, description="Status of last scrape")
    minutes_since_last_scrape: Optional[float] = Field(None, description="Minutes since last scrape")
    reason: str = Field(..., description="Reason for the decision")

