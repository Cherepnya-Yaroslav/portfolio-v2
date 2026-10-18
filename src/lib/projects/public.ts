import "server-only";
import { createClient } from "@supabase/supabase-js";
import { connection } from "next/server";
import { projects as demoProjects, type Project } from "@/content/portfolio";
import { publishedProjects } from "@/content/published-projects";
import { getCoverUrl, getSupabaseConfig, PROJECTS_TABLE } from "@/lib/supabase/config";
import { fetchWithShortConnections } from "@/lib/supabase/server-fetch";
import { projectRowSchema, toPublicProject, type ProjectRecord } from "./schema";

export type PublicProjects = { projects: Project[]; source: "demo" | "snapshot" | "supabase" | "error" };

export async function getPublishedProjects(): Promise<PublicProjects> {
  if (process.env.PROJECTS_SOURCE === "snapshot") {
    return { projects: publishedProjects, source: "snapshot" };
  }
  const config = getSupabaseConfig();
  if (!config) return { projects: demoProjects, source: "demo" };
  await connection();
  const shortConnections = process.env.SUPABASE_NETWORK_MODE === "short-connections";
  const supabase = createClient(config.url, config.key, {
    db: { timeout: 8000, retry: false },
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: shortConnections ? fetchWithShortConnections : (input, init) => fetch(input, { ...init, cache: "no-store", signal: AbortSignal.timeout(8000) }) },
  });
  try {
    const records: ProjectRecord[] = [];
    const pageSize = 2;
    for (let offset = 0; ; offset += pageSize) {
      const query = supabase.from(PROJECTS_TABLE).select("*").eq("visibility", "published").order("sort_order").order("created_at", { ascending: false }).order("id");
      const { data, error } = await (shortConnections ? query.range(offset, offset + pageSize - 1) : query);
      if (error) throw error;
      const page = projectRowSchema.array().parse(data);
      if (shortConnections && page.length > pageSize) throw new Error("Unexpected projects page size");
      records.push(...page);
      if (!shortConnections || page.length < pageSize) break;
    }
    return {
      projects: records.map((row) => toPublicProject(row,
        shortConnections && row.image_path ? `/api/project-covers/${row.image_path.slice("projects/".length)}` : getCoverUrl(row.image_path))),
      source: "supabase",
    };
  } catch {
    if (process.env.NODE_ENV === "development") {
      console.warn("[portfolio] Could not load published projects from Supabase. Showing demo cases locally.");
      return { projects: demoProjects, source: "demo" };
    }
    console.error("[portfolio] Could not load published projects from Supabase.");
    return { projects: [], source: "error" };
  }
}
