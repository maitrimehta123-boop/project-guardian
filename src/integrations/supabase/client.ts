// Browser Supabase client for the live project `lzfcquqtsxkemodhbyqh`.
// Only the public (anon / publishable) key is used here — never a service-role key.
/* eslint-disable */
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

/** The live project this site has always used. */
const PROJECT_REF = "lzfcquqtsxkemodhbyqh";
const DEFAULT_SUPABASE_URL = `https://${PROJECT_REF}.supabase.co`;
/** Public anon key for the project above (safe to ship in the browser bundle). */
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6ZmNxdXF0c3hrZW1vZGhieXFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2NDIwODksImV4cCI6MjEwMTIxODA4OX0._KGjh1D8w216PVdnG_csbsA015twT9erbkBAYhrGcCQ";

/**
 * A build-time env var must be a real anon key for THIS project, otherwise the
 * whole site silently breaks (this exact misconfiguration shipped a malformed
 * key to production and made login/register fail). Reject anything else and
 * fall back to the known-good public key.
 */
const isValidAnonKey = (key: unknown): key is string => {
  if (typeof key !== "string" || key.split(".").length !== 3) return false;
  // New-format publishable keys are opaque, not JWTs — accept them as-is.
  if (key.startsWith("sb_publishable_")) return true;
  try {
    const payload = JSON.parse(
      atob(key.split(".")[1].replace(/-/g, "+").replace(/_/g, "/").padEnd(
        key.split(".")[1].length + ((4 - (key.split(".")[1].length % 4)) % 4),
        "=",
      )),
    );
    return payload?.ref === PROJECT_REF && payload?.role === "anon";
  } catch {
    return false;
  }
};

const envUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const envKey =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ||
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined);

const SUPABASE_URL =
  envUrl && envUrl.includes(PROJECT_REF) ? envUrl.replace(/\/$/, "") : DEFAULT_SUPABASE_URL;

let SUPABASE_PUBLISHABLE_KEY = DEFAULT_SUPABASE_ANON_KEY;
if (envKey) {
  if (isValidAnonKey(envKey)) {
    SUPABASE_PUBLISHABLE_KEY = envKey;
  } else {
    console.error(
      "[supabase] VITE_SUPABASE_ANON_KEY/PUBLISHABLE_KEY is not a valid anon key for project " +
        PROJECT_REF + " — falling back to the built-in public key. Fix the Netlify environment variable.",
    );
  }
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
