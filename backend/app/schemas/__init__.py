"""
Pydantic schemas for API request/response validation and database models.
"""

from .market_schema import (
    Market,
    MarketBase,
    MarketCreate,
    MarketUpdate,
    MarketResponse,
    MarketListResponse,
)

from .scrape_schema import (
    ScrapeHistory,
    ScrapeHistoryBase,
    ScrapeHistoryCreate,
    ScrapeHistoryUpdate,
    ScrapeHistoryResponse,
    ScrapeHistoryListResponse,
    ScrapeStatistics,
    ShouldRunScrapeResponse,
)

from .vector_schema import (
    Vector,
    VectorBase,
    Dataset,
    DatasetBase,
    VectorResponse,
    DatasetResponse,
)

__all__ = [
    # Market schemas
    "Market",
    "MarketBase",
    "MarketCreate",
    "MarketUpdate",
    "MarketResponse",
    "MarketListResponse",
    # Scrape schemas
    "ScrapeHistory",
    "ScrapeHistoryBase",
    "ScrapeHistoryCreate",
    "ScrapeHistoryUpdate",
    "ScrapeHistoryResponse",
    "ScrapeHistoryListResponse",
    "ScrapeStatistics",
    "ShouldRunScrapeResponse",
    # Vector schemas
    "Vector",
    "VectorBase",
    "Dataset",
    "DatasetBase",
    "VectorResponse",
    "DatasetResponse",
]
