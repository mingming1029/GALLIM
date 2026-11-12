import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null | undefined;

export function getSupabase(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    client = null;
    return null;
  }
  client = createClient(url, key);
  return client;
}

let authOnce: Promise<string | null> | null = null;

export function ensureAnonymousSession(supabase: SupabaseClient) {
  if (!authOnce) {
    authOnce = (async () => {
      const existing = await supabase.auth.getSession();
      if (existing.error) return explainAuth(existing.error.message);
      if (existing.data.session) return null;
      const signed = await supabase.auth.signInAnonymously();
      if (signed.error) {
        authOnce = null;
        return explainAuth(signed.error.message);
      }
      return null;
    })();
  }
  return authOnce;
}

function explainAuth(message: string) {
  if (/anonymous/i.test(message)) {
    return "익명 로그인이 꺼져 있습니다. Authentication > Sign In / Providers에서 Anonymous를 켜 주세요.";
  }
  return `로그인하지 못했습니다. ${message}`;
}
