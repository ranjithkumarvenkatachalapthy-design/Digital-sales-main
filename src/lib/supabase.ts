import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase Client Configuration for DigitalSales
 *
 * Team Members Notice:
 * - Credentials must be placed in `.env` or injected via environment variables.
 * - NEVER hardcode your Supabase URL or anon keys in source code.
 */

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

// Check if valid URL format is provided
const isValidUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

export const isSupabaseConfigured: boolean = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  isValidUrl(supabaseUrl)
);

// Safe initialization that avoids runtime app crashes when env vars are unconfigured
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

export interface SupabaseConfigInfo {
  isConfigured: boolean;
  urlPreview: string;
  hasAnonKey: boolean;
}

export const getSupabaseConfigInfo = (): SupabaseConfigInfo => {
  return {
    isConfigured: isSupabaseConfigured,
    urlPreview: supabaseUrl ? `${supabaseUrl.slice(0, 18)}...` : 'Not configured',
    hasAnonKey: Boolean(supabaseAnonKey),
  };
};
