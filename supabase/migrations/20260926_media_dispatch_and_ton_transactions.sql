-- ==============================================================================
-- MEDIA DISPATCH & BLOCKCHAIN TRANSACTIONS: SUPABASE ENGINE SCHEMA & SEEDING
-- Target Database: PostgreSQL / Supabase
-- ==============================================================================

-- 1. Enable UUID Extension for Unique Cryptographic Keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Media Stream Master Playlist Table
CREATE TABLE IF NOT EXISTS public.cinema_playlist_tracks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    show_title VARCHAR(255) NOT NULL,
    season_number INT NOT NULL,
    episode_number INT NOT NULL,
    stream_url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Create Secure Ecosystem Revenue Ledger Table
CREATE TABLE IF NOT EXISTS public.ecosystem_revenue_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source VARCHAR(100) NOT NULL DEFAULT 'TON_STREAM_MONETIZATION',
    wallet_address VARCHAR(255) NOT NULL,
    amount_usdt NUMERIC(20, 6) NOT NULL,
    transaction_signature VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'SETTLED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Create System Playback State Tracker Table
CREATE TABLE IF NOT EXISTS public.cinema_playback_states (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    current_track_id UUID REFERENCES public.cinema_playlist_tracks(id),
    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Upgrade the Playback Tracker to support separate concurrent cinema interfaces (Multi-Room Tracking)
CREATE TABLE IF NOT EXISTS public.multi_cinema_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cinema_id VARCHAR(100) UNIQUE NOT NULL, -- e.g., 'PORTABLE_MINI_CINEMA', 'CINEMA_MAIN', 'SECONDARY_THEATER_PANEL'
    current_track_id UUID REFERENCES public.cinema_playlist_tracks(id),
    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. Build High-Performance Indexes for Real-Time Querying
CREATE INDEX IF NOT EXISTS idx_playlist_lookup ON public.cinema_playlist_tracks(show_title, season_number, episode_number);
CREATE INDEX IF NOT EXISTS idx_revenue_signature ON public.ecosystem_revenue_ledger(transaction_signature);
CREATE INDEX IF NOT EXISTS idx_revenue_wallet ON public.ecosystem_revenue_ledger(wallet_address);
CREATE INDEX IF NOT EXISTS idx_multi_cinema_room ON public.multi_cinema_sessions(cinema_id);

-- 7. Enable Row Level Security (RLS) for Secure Application Operations
ALTER TABLE public.cinema_playlist_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecosystem_revenue_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cinema_playback_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.multi_cinema_sessions ENABLE ROW LEVEL SECURITY;

-- 8. Grant Service Role Bypass Policies for Backend Engine Communication
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow service role full bypass read access' AND tablename = 'cinema_playlist_tracks') THEN
        CREATE POLICY "Allow service role full bypass read access" ON public.cinema_playlist_tracks TO service_role USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow service role full bypass write access' AND tablename = 'ecosystem_revenue_ledger') THEN
        CREATE POLICY "Allow service role full bypass write access" ON public.ecosystem_revenue_ledger TO service_role USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow service role full bypass state access' AND tablename = 'cinema_playback_states') THEN
        CREATE POLICY "Allow service role full bypass state access" ON public.cinema_playback_states TO service_role USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow multi bypass service access' AND tablename = 'multi_cinema_sessions') THEN
        CREATE POLICY "Allow multi bypass service access" ON public.multi_cinema_sessions TO service_role USING (true) WITH CHECK (true);
    END IF;
END $$;

-- 9. Seed tracking coordinates for 'Unstoppable' (Seasons 1-5 Configuration)
INSERT INTO public.cinema_playlist_tracks (show_title, season_number, episode_number, stream_url) VALUES
('Unstoppable', 1, 1, 'https://www.youtube-nocookie.com/embed/d3bOU2yzDks?autoplay=1&mute=0&controls=1&enablejsapi=1&rel=0'),
('Unstoppable', 2, 1, 'https://www.youtube-nocookie.com/embed/2cFmiQUb3Vs?autoplay=1&mute=0&controls=1&enablejsapi=1&rel=0'),
('Unstoppable', 3, 1, 'https://www.youtube-nocookie.com/embed/d3bOU2yzDks?autoplay=1&mute=0&controls=1&enablejsapi=1&rel=0'),
('Unstoppable', 4, 1, 'https://www.youtube-nocookie.com/embed/2cFmiQUb3Vs?autoplay=1&mute=0&controls=1&enablejsapi=1&rel=0'),
('Unstoppable', 5, 1, 'https://www.youtube-nocookie.com/embed/d3bOU2yzDks?autoplay=1&mute=0&controls=1&enablejsapi=1&rel=0')
ON CONFLICT DO NOTHING;

-- 10. Seed tracking coordinates for 'Legend of the Seeker' (Seasons 1-2 Configuration)
INSERT INTO public.cinema_playlist_tracks (show_title, season_number, episode_number, stream_url) VALUES
('Legend of the Seeker', 1, 1, 'https://www.youtube-nocookie.com/embed/d3bOU2yzDks?autoplay=1&mute=0&controls=1&enablejsapi=1&rel=0'),
('Legend of the Seeker', 2, 1, 'https://www.youtube-nocookie.com/embed/2cFmiQUb3Vs?autoplay=1&mute=0&controls=1&enablejsapi=1&rel=0')
ON CONFLICT DO NOTHING;

-- 11. Automated Fallback Traps in Supabase
-- Enforce a database-level integrity check to trap consecutive periods in email columns / wallet address
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_clean_email_format') THEN
        ALTER TABLE public.ecosystem_revenue_ledger 
        ADD CONSTRAINT check_clean_email_format 
        CHECK (wallet_address NOT LIKE '%..%');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_valid_session_states') THEN
        ALTER TABLE public.multi_cinema_sessions 
        ADD CONSTRAINT check_valid_session_states 
        CHECK (cinema_id IN ('PORTABLE_MINI_CINEMA', 'CINEMA_MAIN', 'SECONDARY_THEATER_PANEL'));
    END IF;
END $$;

