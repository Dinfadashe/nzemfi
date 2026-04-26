export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          full_name: string;
          username: string;
          email: string;
          phone: string | null;
          country: string;
          sex: 'male' | 'female' | 'other' | null;
          avatar_url: string | null;
          is_premium: boolean;
          is_artist: boolean;
          is_verified_artist: boolean;
          kyc_status: 'pending' | 'approved' | 'rejected' | null;
          kyc_face_hash: string | null;
          nzm_balance: number;
          wallet_address: string | null;
          total_streams: number;
          account_locked_until: string | null;
          failed_login_attempts: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      tracks: {
        Row: {
          id: string;
          artist_id: string;
          title: string;
          album_id: string | null;
          genre: string;
          audio_url: string;
          cover_url: string | null;
          duration_seconds: number;
          audio_quality: 'standard' | 'hd' | 'lossless';
          stream_count: number;
          like_count: number;
          copyright_status: 'pending' | 'cleared' | 'rejected';
          copyright_fingerprint: string | null;
          release_date: string | null;
          is_exclusive: boolean;
          is_published: boolean;
          lyrics: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['tracks']['Row'], 'created_at' | 'stream_count' | 'like_count'>;
        Update: Partial<Database['public']['Tables']['tracks']['Insert']>;
      };
      albums: {
        Row: {
          id: string;
          artist_id: string;
          title: string;
          cover_url: string | null;
          release_date: string | null;
          album_type: 'album' | 'ep' | 'single';
          is_published: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['albums']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['albums']['Insert']>;
      };
      streams: {
        Row: {
          id: string;
          user_id: string;
          track_id: string;
          listened_seconds: number;
          is_full_play: boolean;
          nzm_earned: number;
          artist_nzm_earned: number;
          user_tier: 'free' | 'premium';
          halving_factor: number;
          device_type: 'web' | 'ios' | 'android';
          ip_address: string | null;
          streamed_at: string;
        };
        Insert: Omit<Database['public']['Tables']['streams']['Row'], 'id' | 'streamed_at'>;
        Update: Partial<Database['public']['Tables']['streams']['Insert']>;
      };
      token_transactions: {
        Row: {
          id: string;
          user_id: string;
          type: 'stream_earn' | 'artist_royalty' | 'referral' | 'withdrawal' | 'premium_bonus' | 'swap';
          amount: number;
          reference_id: string | null;
          tx_hash: string | null;
          status: 'pending' | 'confirmed' | 'failed';
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['token_transactions']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['token_transactions']['Insert']>;
      };
      playlists: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          cover_url: string | null;
          is_public: boolean;
          track_count: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['playlists']['Row'], 'id' | 'created_at' | 'track_count'>;
        Update: Partial<Database['public']['Tables']['playlists']['Insert']>;
      };
      playlist_tracks: {
        Row: {
          id: string;
          playlist_id: string;
          track_id: string;
          position: number;
          added_at: string;
        };
        Insert: Omit<Database['public']['Tables']['playlist_tracks']['Row'], 'id' | 'added_at'>;
        Update: Partial<Database['public']['Tables']['playlist_tracks']['Insert']>;
      };
      likes: {
        Row: {
          id: string;
          user_id: string;
          track_id: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['likes']['Row'], 'id' | 'created_at'>;
        Update: never;
      };
      follows: {
        Row: {
          id: string;
          follower_id: string;
          following_id: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['follows']['Row'], 'id' | 'created_at'>;
        Update: never;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: 'new_release' | 'earning' | 'follow' | 'system' | 'artist_post';
          title: string;
          message: string;
          read_at: string | null;
          data: Json | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>;
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          tier: 'premium';
          status: 'active' | 'cancelled' | 'expired';
          expires_at: string;
          payment_provider: 'stripe' | 'flutterwave' | 'revenuecat';
          payment_ref: string;
          amount_usd: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['subscriptions']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['subscriptions']['Insert']>;
      };
      listening_history: {
        Row: {
          id: string;
          user_id: string;
          track_id: string;
          played_at: string;
        };
        Insert: Omit<Database['public']['Tables']['listening_history']['Row'], 'id'>;
        Update: never;
      };
      halving_schedule: {
        Row: {
          id: string;
          active_users: number;
          halving_count: number;
          free_rate: number;
          premium_rate: number;
          recorded_at: string;
        };
        Insert: Omit<Database['public']['Tables']['halving_schedule']['Row'], 'id'>;
        Update: never;
      };
      artist_posts: {
        Row: {
          id: string;
          artist_id: string;
          content: string;
          image_url: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['artist_posts']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['artist_posts']['Insert']>;
      };
      kyc_sessions: {
        Row: {
          id: string;
          user_id: string;
          session_id: string;
          result: 'pending' | 'passed' | 'failed';
          face_hash: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['kyc_sessions']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['kyc_sessions']['Insert']>;
      };
    };
    Views: {};
    Functions: {
      get_current_halving_rate: {
        Args: { user_tier: string };
        Returns: number;
      };
      record_stream: {
        Args: {
          p_user_id: string;
          p_track_id: string;
          p_listened_seconds: number;
          p_device_type: string;
        };
        Returns: { nzm_earned: number; artist_nzm_earned: number };
      };
    };
    Enums: {};
  };
}

// Shorthand types
export type User = Database['public']['Tables']['users']['Row'];
export type Track = Database['public']['Tables']['tracks']['Row'];
export type Album = Database['public']['Tables']['albums']['Row'];
export type Stream = Database['public']['Tables']['streams']['Row'];
export type TokenTransaction = Database['public']['Tables']['token_transactions']['Row'];
export type Playlist = Database['public']['Tables']['playlists']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];
