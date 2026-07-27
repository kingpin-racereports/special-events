/* ============================================================================
 * Shared Supabase client — loaded by both index.html and
 * race-strategy-planner.html, before their own scripts run.
 *
 * SETUP: replace the two placeholder values below with your actual
 * project's values (Supabase dashboard → Project Settings → Data API):
 *
 *   SUPABASE_URL          → "Project URL"
 *   SUPABASE_PUBLISHABLE_KEY → "anon" / "publishable" key (safe to expose
 *                            client-side — it has no power on its own,
 *                            every table it touches is protected by the
 *                            RLS policies from Stage 1)
 *
 * Also required in the Supabase dashboard before this works:
 *   1. Authentication → Sign In / Providers → enable Google, and paste in
 *      the Google OAuth Client ID/Secret from Google Cloud Console.
 *   2. Authentication → URL Configuration → Site URL and Redirect URLs
 *      must include wherever this app is actually hosted (both
 *      index.html and race-strategy-planner.html's origin) — Supabase
 *      rejects OAuth/magic-link callbacks to any URL not on this list.
 * ==========================================================================
 */
const SUPABASE_URL = "https://YOUR-PROJECT-REF.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "YOUR-ANON-PUBLIC-KEY";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
