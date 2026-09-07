import "server-only";
import { createClient } from "@supabase/supabase-js";
import { connection } from "next/server";
import { projects as demoProjects, type Project } from "@/content/portfolio";
import { getCoverUrl, getSupabaseConfig, PROJECTS_TABLE } from "@/lib/supabase/config";
import { projectRowSchema, toPublicProject } from "./schema";

export type PublicProjects = { projects: Project[]; source: "demo" | "supabase" | "error" };

export async function getPublishedProjects(): Promise<PublicProjects> {
  const config = getSupabaseConfig();
  if (!config) return { projects: demoProjects, source: "demo" };
  await connection();
  const supabase = createClient(config.url, config.key, {
    db: { timeout: 8000, retry: false },
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store", signal: AbortSignal.timeout(8000) }) },
  });
  try {
    const { data, error } = await supabase.from(PROJECTS_TABLE).select("*").eq("visibility", "published").order("sort_order").order("created_at", { ascending: false }).order("id");
    if (error) throw error;
    return { projects: projectRowSchema.array().parse(data).map((row) => toPublicProject(row, getCoverUrl(row.image_path))), source: "supabase" };
  } catch {
    console.error("[portfolio] Could not load published projects from Supabase.");
    return { projects: [], source: "error" };
  }
}
