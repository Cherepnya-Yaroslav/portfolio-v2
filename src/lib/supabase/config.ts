export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim()
    || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && !(parsed.protocol === "http:" && ["localhost", "127.0.0.1"].includes(parsed.hostname))) return null;
    // Privileged keys must never be embedded in the browser bundle.
    if (key.startsWith("sb_secret_")) return null;
    if (key.startsWith("eyJ")) {
      const payload = JSON.parse(atob(key.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))) as { role?: string };
      if (payload.role !== "anon") return null;
    }
    return { url: parsed.origin, key };
  } catch {
    return null;
  }
}

export const PROJECTS_TABLE = "portfolio_projects";
export const ADMINS_TABLE = "portfolio_admins";
export const IMAGES_BUCKET = "portfolio-images";

export function getCoverUrl(path: string | null) {
  const config = getSupabaseConfig();
  return path && config ? `${config.url}/storage/v1/object/public/${IMAGES_BUCKET}/${path}` : "";
}
