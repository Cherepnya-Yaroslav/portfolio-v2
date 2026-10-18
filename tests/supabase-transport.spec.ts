import { createServer, type Server } from "node:http";
import { once } from "node:events";
import { expect, test } from "@playwright/test";
import { downloadProjectCover } from "../src/lib/supabase/cover-download";
import { fetchWithShortConnections } from "../src/lib/supabase/server-fetch";

const original = Buffer.from(Array.from({ length: 81938 }, (_, index) => index % 251));
let server: Server;
let origin: string;
let projectRequests = 0;
let mutationRequests = 0;
let abortedRequests = 0;

test.beforeAll(async () => {
  server = createServer((request, response) => {
    if (request.url === "/projects" || request.url === "/abort") {
      if (request.url === "/projects") projectRequests++; else abortedRequests++;
      if (request.url === "/abort" || projectRequests === 1) {
        response.writeHead(200, { "content-type": "application/json", "content-length": 100 });
        response.write("[");
      } else {
        response.writeHead(200, { "content-type": "application/json" });
        response.end(JSON.stringify([{ name: "Live project", connection: request.headers.connection }]));
      }
      return;
    }
    if (request.url === "/mutation") {
      mutationRequests++;
      response.writeHead(503, { "content-type": "application/json" });
      response.end("{}");
      return;
    }
    const range = request.headers.range?.match(/^bytes=(\d+)-(\d+)$/);
    if (!range) {
      response.writeHead(200, { "content-type": "image/webp", "content-length": original.length });
      response.write(original.subarray(0, 2048));
      return;
    }
    const start = Number(range[1]);
    const end = Math.min(Number(range[2]), original.length - 1);
    response.writeHead(206, {
      "content-type": "image/webp",
      "content-length": end - start + 1,
      "content-range": request.url === "/invalid" ? `bytes 1-${end}/${original.length}`
        : `bytes ${start}-${end}/${request.url === "/oversized" ? 6 * 1024 * 1024 : original.length}`,
      etag: request.url === "/changed" && start > 0 ? '"other-cover"' : '"fixture-cover"',
    });
    response.end(original.subarray(start, end + 1));
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Missing test server address");
  origin = `http://127.0.0.1:${address.port}`;
});

test.afterAll(() => { server.closeAllConnections(); server.close(); });

test("a cover remains complete when full responses stall after the first bytes", async () => {
  const result = await downloadProjectCover(new URL("/cover.webp", origin));
  expect(result.equals(original)).toBe(true);
});

test("inconsistent ranges and changed or excessive objects are rejected", async () => {
  for (const pathname of ["/invalid", "/changed", "/oversized"]) {
    await expect(downloadProjectCover(new URL(pathname, origin))).rejects.toThrow(/Invalid cover range|Cover changed/);
  }
});

test("a stalled JSON body is retried on a fresh connection", async () => {
  const response = await fetchWithShortConnections(new URL("/projects", origin));
  expect(await response.json()).toEqual([{ name: "Live project", connection: "close" }]);
  expect(projectRequests).toBe(2);
});

test("caller cancellation is respected and mutations are never replayed", async () => {
  await expect(fetchWithShortConnections(new URL("/abort", origin), { signal: AbortSignal.timeout(50) })).rejects.toThrow();
  expect(abortedRequests).toBe(1);
  expect((await fetchWithShortConnections(new URL("/mutation", origin), { method: "POST" })).status).toBe(503);
  expect(mutationRequests).toBe(1);
});
