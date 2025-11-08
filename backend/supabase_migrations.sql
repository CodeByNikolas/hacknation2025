-- Migration: Add scrape tracking and deduplication features
-- Run this in your Supabase SQL Editor

-- 1. Create scrape_history table to track scraping runs
CREATE TABLE IF NOT EXISTS scrape_history (
    id BIGSERIAL PRIMARY KEY,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    status VARCHAR(50) NOT NULL DEFAULT 'running', -- 'running', 'completed', 'failed'
    markets_fetched INTEGER DEFAULT 0,
    markets_added INTEGER DEFAULT 0,
    markets_updated INTEGER DEFAULT 0,
    markets_failed INTEGER DEFAULT 0,
    error_message TEXT,
    instance_id VARCHAR(255), -- Identifier for the machine/instance running the scrape
    duration_seconds NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_scrape_history_started_at ON scrape_history(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_scrape_history_status ON scrape_history(status);
CREATE INDEX IF NOT EXISTS idx_scrape_history_instance_id ON scrape_history(instance_id);

-- 3. Add RLS policies for scrape_history
ALTER TABLE scrape_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service role full access to scrape_history" ON scrape_history
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow public read access to scrape_history" ON scrape_history
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- 4. Create function to check if scraping should run
CREATE OR REPLACE FUNCTION should_run_scrape(
    min_interval_minutes INTEGER DEFAULT 55
)
RETURNS TABLE(
    should_run BOOLEAN,
    last_scrape_time TIMESTAMPTZ,
    last_scrape_status VARCHAR,
    minutes_since_last_scrape NUMERIC
) AS $$
DECLARE
    last_completed_scrape RECORD;
    last_running_scrape RECORD;
BEGIN
    -- Check for any running scrapes
    SELECT * INTO last_running_scrape
    FROM scrape_history
    WHERE status = 'running'
    ORDER BY started_at DESC
    LIMIT 1;
    
    -- If there's a running scrape started less than 2 hours ago, don't run
    IF last_running_scrape.id IS NOT NULL 
       AND last_running_scrape.started_at > NOW() - INTERVAL '2 hours' THEN
        RETURN QUERY SELECT 
            false,
            last_running_scrape.started_at,
            'running'::VARCHAR,
            EXTRACT(EPOCH FROM (NOW() - last_running_scrape.started_at)) / 60;
        RETURN;
    END IF;
    
    -- Check last completed scrape
    SELECT * INTO last_completed_scrape
    FROM scrape_history
    WHERE status = 'completed'
    ORDER BY completed_at DESC
    LIMIT 1;
    
    -- If no completed scrape exists, should run
    IF last_completed_scrape.id IS NULL THEN
        RETURN QUERY SELECT true, NULL::TIMESTAMPTZ, NULL::VARCHAR, NULL::NUMERIC;
        RETURN;
    END IF;
    
    -- Check if enough time has passed since last completed scrape
    IF last_completed_scrape.completed_at < NOW() - (min_interval_minutes || ' minutes')::INTERVAL THEN
        RETURN QUERY SELECT 
            true,
            last_completed_scrape.completed_at,
            'completed'::VARCHAR,
            EXTRACT(EPOCH FROM (NOW() - last_completed_scrape.completed_at)) / 60;
    ELSE
        RETURN QUERY SELECT 
            false,
            last_completed_scrape.completed_at,
            'completed'::VARCHAR,
            EXTRACT(EPOCH FROM (NOW() - last_completed_scrape.completed_at)) / 60;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 5. Create function to get scrape statistics
CREATE OR REPLACE FUNCTION get_scrape_statistics()
RETURNS TABLE(
    total_scrapes BIGINT,
    successful_scrapes BIGINT,
    failed_scrapes BIGINT,
    last_scrape_time TIMESTAMPTZ,
    last_scrape_status VARCHAR,
    average_duration_seconds NUMERIC,
    total_markets_tracked BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_scrapes,
        COUNT(*) FILTER (WHERE status = 'completed')::BIGINT as successful_scrapes,
        COUNT(*) FILTER (WHERE status = 'failed')::BIGINT as failed_scrapes,
        MAX(completed_at) as last_scrape_time,
        (SELECT status FROM scrape_history ORDER BY started_at DESC LIMIT 1) as last_scrape_status,
        AVG(duration_seconds) FILTER (WHERE status = 'completed') as average_duration_seconds,
        (SELECT COUNT(*) FROM markets)::BIGINT as total_markets_tracked
    FROM scrape_history;
END;
$$ LANGUAGE plpgsql;

-- 6. Clean up stale running scrapes (older than 2 hours)
CREATE OR REPLACE FUNCTION cleanup_stale_scrapes()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE scrape_history
    SET 
        status = 'failed',
        error_message = 'Scrape timed out - marked as stale',
        completed_at = NOW()
    WHERE 
        status = 'running'
        AND started_at < NOW() - INTERVAL '2 hours';
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- 7. Add constraint to markets table for true deduplication
-- This ensures polymarket_id is truly unique
ALTER TABLE markets 
    DROP CONSTRAINT IF EXISTS markets_polymarket_id_key;

ALTER TABLE markets 
    ADD CONSTRAINT markets_polymarket_id_key UNIQUE (polymarket_id);

-- 8. Add last_updated_at column to markets if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'markets' AND column_name = 'last_scraped_at'
    ) THEN
        ALTER TABLE markets ADD COLUMN last_scraped_at TIMESTAMPTZ DEFAULT NOW();
        CREATE INDEX idx_markets_last_scraped_at ON markets(last_scraped_at);
    END IF;
END $$;

-- 9. Create trigger to update last_scraped_at on upsert
CREATE OR REPLACE FUNCTION update_last_scraped_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_scraped_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_last_scraped_at ON markets;
CREATE TRIGGER trigger_update_last_scraped_at
    BEFORE INSERT OR UPDATE ON markets
    FOR EACH ROW
    EXECUTE FUNCTION update_last_scraped_at();

COMMENT ON TABLE scrape_history IS 'Tracks all scraping runs with timing and statistics';
COMMENT ON FUNCTION should_run_scrape IS 'Checks if a new scrape should run based on last scrape time and status';
COMMENT ON FUNCTION get_scrape_statistics IS 'Returns overall statistics about scraping activity';
COMMENT ON FUNCTION cleanup_stale_scrapes IS 'Marks old running scrapes as failed to prevent deadlocks';

