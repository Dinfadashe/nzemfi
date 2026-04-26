-- ============================================================
-- NzemFi Platform — Complete Database Schema
-- Run via: supabase db push
-- ============================================================

-- Enable extensions
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- not needed in PG17, using gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for fuzzy search

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id                    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name             TEXT NOT NULL,
  username              TEXT UNIQUE NOT NULL,
  email                 TEXT UNIQUE NOT NULL,
  phone                 TEXT,
  country               TEXT NOT NULL,
  sex                   TEXT CHECK (sex IN ('male','female','other')),
  avatar_url            TEXT,
  is_premium            BOOLEAN NOT NULL DEFAULT FALSE,
  is_artist             BOOLEAN NOT NULL DEFAULT FALSE,
  is_verified_artist    BOOLEAN NOT NULL DEFAULT FALSE,
  kyc_status            TEXT DEFAULT 'pending' CHECK (kyc_status IN ('pending','approved','rejected')),
  kyc_face_hash         TEXT UNIQUE,
  nzm_balance           NUMERIC(18,8) NOT NULL DEFAULT 0,
  wallet_address        TEXT UNIQUE,
  total_streams         BIGINT NOT NULL DEFAULT 0,
  account_locked_until  TIMESTAMPTZ,
  failed_login_attempts INT NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_username  ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_email     ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_kyc_hash  ON public.users(kyc_face_hash);
CREATE INDEX IF NOT EXISTS idx_users_country   ON public.users(country);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_updated_at ON public.users;
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ALBUMS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.albums (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  cover_url    TEXT,
  release_date DATE,
  album_type   TEXT NOT NULL DEFAULT 'single' CHECK (album_type IN ('album','ep','single')),
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_albums_artist ON public.albums(artist_id);

-- ============================================================
-- TRACKS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tracks (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id             UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  album_id              UUID REFERENCES public.albums(id) ON DELETE SET NULL,
  title                 TEXT NOT NULL,
  genre                 TEXT NOT NULL,
  audio_url             TEXT NOT NULL,
  cover_url             TEXT,
  duration_seconds      INT NOT NULL DEFAULT 0,
  audio_quality         TEXT NOT NULL DEFAULT 'standard' CHECK (audio_quality IN ('standard','hd','lossless')),
  stream_count          BIGINT NOT NULL DEFAULT 0,
  like_count            BIGINT NOT NULL DEFAULT 0,
  copyright_status      TEXT NOT NULL DEFAULT 'pending' CHECK (copyright_status IN ('pending','cleared','rejected')),
  copyright_fingerprint TEXT,
  release_date          DATE,
  is_exclusive          BOOLEAN NOT NULL DEFAULT FALSE,
  is_published          BOOLEAN NOT NULL DEFAULT FALSE,
  lyrics                TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tracks_artist       ON public.tracks(artist_id);
CREATE INDEX IF NOT EXISTS idx_tracks_genre        ON public.tracks(genre);
CREATE INDEX IF NOT EXISTS idx_tracks_stream_count ON public.tracks(stream_count DESC);
CREATE INDEX IF NOT EXISTS idx_tracks_published    ON public.tracks(is_published) WHERE is_published = TRUE;
CREATE INDEX IF NOT EXISTS idx_tracks_title_trgm   ON public.tracks USING gin(title gin_trgm_ops);

-- ============================================================
-- STREAMS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.streams (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  track_id           UUID NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
  listened_seconds   INT NOT NULL DEFAULT 0,
  is_full_play       BOOLEAN NOT NULL DEFAULT FALSE,
  nzm_earned        NUMERIC(8,4) NOT NULL DEFAULT 0,
  artist_nzm_earned NUMERIC(8,4) NOT NULL DEFAULT 0,
  user_tier          TEXT NOT NULL DEFAULT 'free' CHECK (user_tier IN ('free','premium')),
  halving_factor     NUMERIC(8,6) NOT NULL DEFAULT 1,
  device_type        TEXT NOT NULL DEFAULT 'web' CHECK (device_type IN ('web','ios','android')),
  ip_address         INET,
  streamed_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_streams_user      ON public.streams(user_id);
CREATE INDEX IF NOT EXISTS idx_streams_track     ON public.streams(track_id);
CREATE INDEX IF NOT EXISTS idx_streams_date      ON public.streams(streamed_at DESC);
CREATE INDEX IF NOT EXISTS idx_streams_user_date ON public.streams(user_id, streamed_at DESC);

-- ============================================================
-- TOKEN TRANSACTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.token_transactions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type         TEXT NOT NULL CHECK (type IN ('stream_earn','artist_royalty','referral','withdrawal','premium_bonus','swap')),
  amount       NUMERIC(18,8) NOT NULL,
  reference_id UUID,
  tx_hash      TEXT,
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','failed')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_txns_user   ON public.token_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_txns_type   ON public.token_transactions(type);
CREATE INDEX IF NOT EXISTS idx_txns_status ON public.token_transactions(status);
CREATE INDEX IF NOT EXISTS idx_txns_date   ON public.token_transactions(created_at DESC);

-- ============================================================
-- PLAYLISTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.playlists (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  cover_url   TEXT,
  is_public   BOOLEAN NOT NULL DEFAULT TRUE,
  track_count INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_playlists_user ON public.playlists(user_id);

CREATE TABLE IF NOT EXISTS public.playlist_tracks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  track_id    UUID NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
  position    INT NOT NULL DEFAULT 0,
  added_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(playlist_id, track_id)
);

CREATE INDEX IF NOT EXISTS idx_pt_playlist ON public.playlist_tracks(playlist_id);

-- ============================================================
-- LIKES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.likes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  track_id   UUID NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, track_id)
);

CREATE INDEX IF NOT EXISTS idx_likes_user  ON public.likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_track ON public.likes(track_id);

-- ============================================================
-- FOLLOWS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.follows (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id  UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK(follower_id != following_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_follower  ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows(following_id);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type       TEXT NOT NULL CHECK (type IN ('new_release','earning','follow','system','artist_post')),
  title      TEXT NOT NULL,
  message    TEXT NOT NULL,
  read_at    TIMESTAMPTZ,
  data       JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifs_user   ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifs_unread ON public.notifications(user_id, read_at) WHERE read_at IS NULL;

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  tier             TEXT NOT NULL DEFAULT 'premium' CHECK (tier IN ('premium')),
  status           TEXT NOT NULL CHECK (status IN ('active','cancelled','expired')),
  expires_at       TIMESTAMPTZ NOT NULL,
  payment_provider TEXT NOT NULL CHECK (payment_provider IN ('stripe','flutterwave','revenuecat')),
  payment_ref      TEXT NOT NULL,
  amount_usd       NUMERIC(6,2) NOT NULL DEFAULT 1.00,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subs_user   ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subs_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subs_expiry ON public.subscriptions(expires_at);

-- ============================================================
-- LISTENING HISTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS public.listening_history (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  track_id  UUID NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
  played_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_history_user ON public.listening_history(user_id, played_at DESC);

-- ============================================================
-- HALVING SCHEDULE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.halving_schedule (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  active_users  BIGINT NOT NULL,
  halving_count INT NOT NULL DEFAULT 0,
  free_rate     NUMERIC(10,8) NOT NULL DEFAULT 0.25,
  premium_rate  NUMERIC(10,8) NOT NULL DEFAULT 0.50,
  recorded_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.halving_schedule (active_users, halving_count, free_rate, premium_rate)
VALUES (0, 0, 0.25000000, 0.50000000);

-- ============================================================
-- ARTIST POSTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.artist_posts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id  UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  image_url  TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_artist_posts ON public.artist_posts(artist_id, created_at DESC);

-- ============================================================
-- KYC SESSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.kyc_sessions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  result     TEXT NOT NULL DEFAULT 'pending' CHECK (result IN ('pending','passed','failed')),
  face_hash  TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kyc_user ON public.kyc_sessions(user_id);

-- ============================================================
-- MESSAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id   UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  read_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK(sender_id != receiver_id)
);

CREATE INDEX IF NOT EXISTS idx_messages_sender   ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON public.messages(receiver_id);

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION increment_stream_count(track_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.tracks SET stream_count = stream_count + 1 WHERE id = track_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_balance(user_id UUID, amount NUMERIC)
RETURNS VOID AS $$
BEGIN
  UPDATE public.users SET nzm_balance = nzm_balance + amount WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_current_halving_rate(p_tier TEXT)
RETURNS NUMERIC AS $$
DECLARE
  v_rate NUMERIC;
BEGIN
  SELECT CASE WHEN p_tier = 'premium' THEN premium_rate ELSE free_rate END
  INTO v_rate
  FROM public.halving_schedule
  ORDER BY recorded_at DESC
  LIMIT 1;
  RETURN COALESCE(v_rate, CASE WHEN p_tier = 'premium' THEN 0.5 ELSE 0.25 END);
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION increment_like_count(track_id UUID, delta INT DEFAULT 1)
RETURNS VOID AS $$
BEGIN
  UPDATE public.tracks SET like_count = GREATEST(0, like_count + delta) WHERE id = track_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.users               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracks              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.albums              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streams             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_transactions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_tracks     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listening_history   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_posts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_sessions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.halving_schedule    ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users are publicly readable" ON public.users
  FOR SELECT USING (TRUE);
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Published tracks are public" ON public.tracks
  FOR SELECT USING (is_published = TRUE AND copyright_status = 'cleared');
CREATE POLICY "Artists can manage own tracks" ON public.tracks
  FOR ALL USING (auth.uid() = artist_id);

CREATE POLICY "Published albums are public" ON public.albums
  FOR SELECT USING (is_published = TRUE);
CREATE POLICY "Artists manage own albums" ON public.albums
  FOR ALL USING (auth.uid() = artist_id);

CREATE POLICY "Users see own streams" ON public.streams
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own streams" ON public.streams
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users see own transactions" ON public.token_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Public playlists readable" ON public.playlists
  FOR SELECT USING (is_public = TRUE OR auth.uid() = user_id);
CREATE POLICY "Users manage own playlists" ON public.playlists
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Playlist tracks follow playlist" ON public.playlist_tracks
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.playlists p WHERE p.id = playlist_id AND (p.is_public OR p.user_id = auth.uid()))
  );
CREATE POLICY "Users manage own playlist tracks" ON public.playlist_tracks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.playlists p WHERE p.id = playlist_id AND p.user_id = auth.uid())
  );

CREATE POLICY "Likes are public" ON public.likes FOR SELECT USING (TRUE);
CREATE POLICY "Users manage own likes" ON public.likes
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Follows are public" ON public.follows FOR SELECT USING (TRUE);
CREATE POLICY "Users manage own follows" ON public.follows
  FOR ALL USING (auth.uid() = follower_id);

CREATE POLICY "Users see own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users see own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users see own history" ON public.listening_history
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own history" ON public.listening_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Artist posts are public" ON public.artist_posts
  FOR SELECT USING (TRUE);
CREATE POLICY "Artists manage own posts" ON public.artist_posts
  FOR ALL USING (auth.uid() = artist_id);

CREATE POLICY "Users see own KYC sessions" ON public.kyc_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Message participants can read" ON public.messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Halving schedule is public" ON public.halving_schedule
  FOR SELECT USING (TRUE);

-- ============================================================
-- REALTIME
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.token_transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.streams;
ALTER PUBLICATION supabase_realtime ADD TABLE public.halving_schedule;

-- ============================================================
-- WITHDRAWAL REQUESTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES public.token_transactions(id),
  amount_nzm     NUMERIC(18,8) NOT NULL,
  fee_nzm        NUMERIC(18,8) NOT NULL DEFAULT 0,
  wallet_address TEXT NOT NULL,
  status         TEXT NOT NULL DEFAULT 'queued'
                   CHECK (status IN ('queued','processing','completed','rejected')),
  tx_hash        TEXT,
  admin_note     TEXT,
  processed_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wr_user   ON public.withdrawal_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_wr_status ON public.withdrawal_requests(status);
CREATE INDEX IF NOT EXISTS idx_wr_date   ON public.withdrawal_requests(created_at DESC);

ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own withdrawal requests" ON public.withdrawal_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own withdrawal requests" ON public.withdrawal_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);