import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { imagePathSchema } from "@/lib/projects/schema";
import { getCoverUrl, getSupabaseConfig } from "@/lib/supabase/config";
import { CoverDownloadError, downloadProjectCover } from "@/lib/supabase/cover-download";

export const runtime = "nodejs";

const downloads = new Map<string, Promise<Buffer>>();

async function loadCover(filename: string, url: URL): Promise<Buffer> {
  const namespace = createHash("sha256").update(url.origin).digest("hex").slice(0, 16);
  const cacheDirectory = path.join(process.cwd(), process.env.PORTFOLIO_BUILD_DIR || ".next", "cache/portfolio-covers", namespace);
  const target = path.join(cacheDirectory, filename);
  try { return await readFile(target); } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  const existing = downloads.get(filename);
  if (existing) return existing;
  const pending = (async () => {
    const bytes = await downloadProjectCover(url);
    await mkdir(cacheDirectory, { recursive: true });
    const temporary = `${target}.${randomUUID()}.tmp`;
    try { await writeFile(temporary, bytes); await rename(temporary, target); }
    finally { await rm(temporary, { force: true }); }
    return bytes;
  })();
  downloads.set(filename, pending);
  try { return await pending; } finally { downloads.delete(filename); }
}

export async function GET(_request: Request, context: { params: Promise<{ filename: string }> }) {
  const { filename } = await context.params;
  const imagePath = imagePathSchema.safeParse(`projects/${filename}`);
  if (!imagePath.success) return new Response("Not found", { status: 404 });
  if (!getSupabaseConfig()) return new Response("Storage unavailable", { status: 503 });
  try {
    const bytes = await loadCover(filename, new URL(getCoverUrl(imagePath.data)));
    const extension = filename.split(".").pop();
    const contentType = extension === "jpg" ? "image/jpeg" : `image/${extension}`;
    return new Response(new Uint8Array(bytes), { headers: {
      "Content-Type": contentType,
      "Content-Length": String(bytes.length),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    } });
  } catch (error) {
    console.error("[portfolio] Could not load project cover.");
    return new Response("Cover unavailable", { status: error instanceof CoverDownloadError ? error.status : 502 });
  }
}
