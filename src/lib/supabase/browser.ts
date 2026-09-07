import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "./config";

let client: SupabaseClient | undefined;

export function getBrowserSupabase() {
  const config = getSupabaseConfig();
  if (!config) throw new Error("Подключение Supabase не настроено.");
  client ??= createClient(config.url, config.key, {
    db: { timeout: 15000, retry: false },
    auth: { storageKey: "yaroslav-portfolio-admin", persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
  });
  return client;
}
