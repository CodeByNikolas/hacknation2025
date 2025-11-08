from supabase import Client
import logging
from datetime import datetime
import socket
import os
from typing import Optional, Tuple
from ..schemas.scrape_schema import ScrapeHistoryCreate, ScrapeHistoryUpdate

logger = logging.getLogger(__name__)

class ScrapeTracker:
    def __init__(self, supabase_client: Client):
        self.client = supabase_client
        self.scrape_id = None
        self.instance_id = self._generate_instance_id()
    
    def _generate_instance_id(self) -> str:
        """Generate a unique identifier for this instance."""
        hostname = socket.gethostname()
        pid = os.getpid()
        return f"{hostname}-{pid}"
    
    def should_run_scrape(self, min_interval_minutes: int = 55) -> Tuple[bool, str]:
        """
        Check if scraping should run based on last scrape time.
        Returns (should_run, reason)
        """
        try:
            logger.info("=" * 80)
            logger.info("Checking if scrape should run...")
            
            # Call the PostgreSQL function
            result = self.client.rpc('should_run_scrape', {
                'min_interval_minutes': min_interval_minutes
            }).execute()
            
            if result.data and len(result.data) > 0:
                data = result.data[0]
                should_run = data.get('should_run', False)
                last_scrape_status = data.get('last_scrape_status')
                minutes_since = data.get('minutes_since_last_scrape')
                
                if should_run:
                    logger.info("✓ Scrape check PASSED")
                    if minutes_since:
                        logger.info(f"  Last successful scrape: {minutes_since:.1f} minutes ago")
                    else:
                        logger.info("  No previous scrapes found")
                    logger.info("=" * 80)
                    return True, "Sufficient time has passed since last scrape"
                else:
                    if last_scrape_status == 'running':
                        logger.warning("✗ Scrape check FAILED: Another scrape is currently running")
                        logger.warning(f"  Started {minutes_since:.1f} minutes ago on another instance")
                        reason = f"Another scrape is running (started {minutes_since:.1f}m ago)"
                    else:
                        logger.warning("✗ Scrape check FAILED: Too soon since last scrape")
                        logger.warning(f"  Last scrape completed {minutes_since:.1f} minutes ago")
                        logger.warning(f"  Minimum interval: {min_interval_minutes} minutes")
                        reason = f"Too soon since last scrape ({minutes_since:.1f}m ago, need {min_interval_minutes}m)"
                    logger.info("=" * 80)
                    return False, reason
            
            # If function call fails or returns nothing, allow scrape
            logger.warning("⚠ Could not check scrape status, allowing scrape to proceed")
            logger.info("=" * 80)
            return True, "Could not verify last scrape time"
            
        except Exception as e:
            logger.error(f"Error checking scrape status: {e}")
            logger.warning("Allowing scrape to proceed due to error")
            logger.info("=" * 80)
            return True, f"Error checking status: {str(e)}"
    
    def start_scrape(self) -> Optional[int]:
        """
        Record the start of a scrape run using validated schema.
        Returns the scrape_id for tracking.
        """
        try:
            logger.info("📝 Recording scrape start...")
            
            # Use schema for validation
            scrape_create = ScrapeHistoryCreate(
                status='running',
                instance_id=self.instance_id
            )
            
            result = self.client.table('scrape_history').insert(
                scrape_create.model_dump(exclude_none=True)
            ).execute()
            
            if result.data and len(result.data) > 0:
                self.scrape_id = result.data[0]['id']
                logger.info(f"✓ Scrape started with ID: {self.scrape_id}")
                logger.info(f"  Instance: {self.instance_id}")
                return self.scrape_id
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to record scrape start: {e}")
            return None
    
    def update_scrape_progress(self, markets_fetched: int = 0, markets_added: int = 0, 
                              markets_updated: int = 0, markets_failed: int = 0):
        """Update the progress of the current scrape using validated schema."""
        if not self.scrape_id:
            return
        
        try:
            # Use schema for validation
            update_data = ScrapeHistoryUpdate(
                markets_fetched=markets_fetched,
                markets_added=markets_added,
                markets_updated=markets_updated,
                markets_failed=markets_failed
            )
            
            self.client.table('scrape_history').update(
                update_data.model_dump(exclude_none=True)
            ).eq('id', self.scrape_id).execute()
            
        except Exception as e:
            logger.error(f"Failed to update scrape progress: {e}")
    
    def complete_scrape(self, markets_fetched: int, markets_added: int, 
                       markets_updated: int, markets_failed: int, 
                       duration_seconds: float):
        """Mark the scrape as completed successfully using validated schema."""
        if not self.scrape_id:
            logger.warning("No scrape_id to complete")
            return
        
        try:
            logger.info("=" * 80)
            logger.info("📊 Recording scrape completion...")
            
            # Use schema for validation
            complete_data = ScrapeHistoryUpdate(
                status='completed',
                completed_at=datetime.utcnow(),
                markets_fetched=markets_fetched,
                markets_added=markets_added,
                markets_updated=markets_updated,
                markets_failed=markets_failed,
                duration_seconds=round(duration_seconds, 2)
            )
            
            self.client.table('scrape_history').update(
                complete_data.model_dump(exclude_none=True)
            ).eq('id', self.scrape_id).execute()
            
            logger.info(f"✓ Scrape #{self.scrape_id} completed successfully")
            logger.info(f"  Duration: {duration_seconds:.2f} seconds")
            logger.info(f"  Markets fetched: {markets_fetched}")
            logger.info(f"  Markets added: {markets_added}")
            logger.info(f"  Markets updated: {markets_updated}")
            if markets_failed > 0:
                logger.warning(f"  Markets failed: {markets_failed}")
            logger.info("=" * 80)
            
        except Exception as e:
            logger.error(f"Failed to mark scrape as completed: {e}")
    
    def fail_scrape(self, error_message: str, duration_seconds: float = None):
        """Mark the scrape as failed using validated schema."""
        if not self.scrape_id:
            logger.warning("No scrape_id to mark as failed")
            return
        
        try:
            logger.error("=" * 80)
            logger.error("❌ Recording scrape failure...")
            
            # Use schema for validation
            fail_data = ScrapeHistoryUpdate(
                status='failed',
                completed_at=datetime.utcnow(),
                error_message=error_message[:500],  # Limit error message length
                duration_seconds=round(duration_seconds, 2) if duration_seconds is not None else None
            )
            
            self.client.table('scrape_history').update(
                fail_data.model_dump(exclude_none=True)
            ).eq('id', self.scrape_id).execute()
            
            logger.error(f"✗ Scrape #{self.scrape_id} marked as failed")
            logger.error(f"  Error: {error_message[:200]}")
            logger.error("=" * 80)
            
        except Exception as e:
            logger.error(f"Failed to mark scrape as failed: {e}")
    
    def cleanup_stale_scrapes(self):
        """Clean up any stale running scrapes (older than 2 hours)."""
        try:
            result = self.client.rpc('cleanup_stale_scrapes').execute()
            if result.data and result.data > 0:
                logger.info(f"🧹 Cleaned up {result.data} stale scrape(s)")
        except Exception as e:
            logger.error(f"Failed to cleanup stale scrapes: {e}")
    
    def get_statistics(self) -> dict:
        """Get overall scraping statistics."""
        try:
            result = self.client.rpc('get_scrape_statistics').execute()
            if result.data and len(result.data) > 0:
                return result.data[0]
            return {}
        except Exception as e:
            logger.error(f"Failed to get scrape statistics: {e}")
            return {}

