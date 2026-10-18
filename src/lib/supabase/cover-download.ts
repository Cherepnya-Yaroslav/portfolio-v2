import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";

const CHUNK_BYTES = 2048;
const MAX_BYTES = 5 * 1024 * 1024;
const CONCURRENCY = 4;

export class CoverDownloadError extends Error {
  constructor(message: string, readonly status = 502) { super(message); }
}

type CoverChunk = { bytes: Buffer; total: number; etag?: string };

async function requestChunk(url: URL, start: number, end: number, expected?: CoverChunk): Promise<CoverChunk> {
  if (url.protocol !== "https:" && !(url.protocol === "http:" && ["127.0.0.1", "localhost"].includes(url.hostname))) {
    throw new CoverDownloadError("Unsupported cover origin");
  }
  for (let attempt = 0; ; attempt++) {
    try {
      return await new Promise<CoverChunk>((resolve, reject) => {
        const request = url.protocol === "https:" ? httpsRequest : httpRequest;
        const outgoing = request(url, {
          agent: false,
          maxVersion: "TLSv1.2",
          headers: {
            connection: "close",
            "accept-encoding": "identity",
            range: `bytes=${start}-${end}`,
            ...(expected?.etag ? { "if-match": expected.etag } : {}),
          },
        }, (response) => {
          const range = response.headers["content-range"]?.match(/^bytes (\d+)-(\d+)\/(\d+)$/);
          const total = Number(range?.[3]);
          const last = Math.min(end, total - 1);
          const etag = response.headers.etag;
          const fail = (error: Error) => { reject(error); response.destroy(); outgoing.destroy(); };
          if (response.statusCode !== 206) {
            fail(response.statusCode && response.statusCode >= 500 ? new Error("Cover origin unavailable")
              : new CoverDownloadError("Cover range request failed", response.statusCode === 404 || response.statusCode === 400 ? 404 : 502));
            return;
          }
          if (!range || !Number.isSafeInteger(total) || total < 1 || total > MAX_BYTES || Number(range[1]) !== start || Number(range[2]) !== last) {
            fail(new CoverDownloadError("Invalid cover range"));
            return;
          }
          if (expected && (total !== expected.total || etag !== expected.etag)) {
            fail(new CoverDownloadError("Cover changed during download"));
            return;
          }
          const chunks: Buffer[] = [];
          let received = 0;
          response.on("data", (chunk: Buffer) => {
            received += chunk.length;
            if (received > last - start + 1) { fail(new CoverDownloadError("Oversized cover range")); return; }
            chunks.push(chunk);
          });
          response.on("end", () => {
            if (received !== last - start + 1) { reject(new Error("Incomplete cover range")); return; }
            resolve({ bytes: Buffer.concat(chunks), total, etag });
          });
          response.on("error", reject);
        });
        const timeout = setTimeout(() => outgoing.destroy(new Error("Cover request timed out")), 2500);
        outgoing.on("close", () => clearTimeout(timeout));
        outgoing.on("error", reject);
        outgoing.end();
      });
    } catch (error) {
      if (attempt >= 2 || error instanceof CoverDownloadError) throw error;
    }
  }
}

export async function downloadProjectCover(url: URL): Promise<Buffer> {
  const first = await requestChunk(url, 0, CHUNK_BYTES - 1);
  const result = Buffer.alloc(first.total);
  first.bytes.copy(result);
  let next = CHUNK_BYTES;
  let stopped = false;
  await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
    while (!stopped && next < first.total) {
      const start = next;
      next += CHUNK_BYTES;
      const chunk = await requestChunk(url, start, Math.min(start + CHUNK_BYTES - 1, first.total - 1), first);
      chunk.bytes.copy(result, start);
    }
  })).catch((error: unknown) => { stopped = true; throw error; });
  return result;
}
