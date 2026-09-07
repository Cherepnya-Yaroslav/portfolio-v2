import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";

const adminId = "11111111-1111-4111-8111-111111111111";
const visitorId = "22222222-2222-4222-8222-222222222222";
const image = readFileSync(new URL("../../public/images/yaroslav.webp", import.meta.url));
let records = [];
let files = new Set();
let failReads = false;
let failWrites = false;

function session(email) {
  const id = email === "admin@example.test" ? adminId : visitorId;
  const user = { id, aud: "authenticated", role: "authenticated", email, email_confirmed_at: new Date().toISOString(), app_metadata: { provider: "email", providers: ["email"] }, user_metadata: {}, created_at: new Date().toISOString() };
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const token = `${encode({ alg: "HS256", typ: "JWT" })}.${encode({ sub: id, aud: "authenticated", role: "authenticated", email, exp: Math.floor(Date.now() / 1000) + 3600 })}.test-signature`;
  return { access_token: token, token_type: "bearer", expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, refresh_token: `test-refresh-${id}`, user };
}

createServer(async (request, response) => {
  response.setHeader("Access-Control-Allow-Origin", "http://127.0.0.1:3101");
  response.setHeader("Access-Control-Allow-Headers", request.headers["access-control-request-headers"] || "authorization, apikey, content-type");
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,HEAD,OPTIONS");
  response.setHeader("Access-Control-Expose-Headers", "content-range");
  response.setHeader("Content-Type", "application/json");
  const send = (status, data) => { response.statusCode = status; response.end(data === undefined ? undefined : JSON.stringify(data)); };
  if (request.method === "OPTIONS") return send(204);
  const url = new URL(request.url, "http://127.0.0.1:3111");
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString();
  let body = {};
  if (request.headers["content-type"]?.includes("application/json") && raw) body = JSON.parse(raw);
  const token = request.headers.authorization?.replace("Bearer ", "") ?? "";
  let userId = "";
  try { userId = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString()).sub; } catch { /* Anonymous test request. */ }
  const isAdmin = userId === adminId;

  if (url.pathname === "/health") return send(200, { ok: true });
  if (url.pathname === "/__test/reset") { records = []; files = new Set(); failReads = false; failWrites = false; return send(200, {}); }
  if (url.pathname === "/__test/state") return send(200, { records, files: [...files] });
  if (url.pathname === "/__test/failures") { failReads = Boolean(body.reads); failWrites = Boolean(body.writes); return send(200, {}); }
  if (url.pathname === "/auth/v1/token") {
    if (url.searchParams.get("grant_type") === "refresh_token") return send(200, session(String(body.refresh_token).includes(adminId) ? "admin@example.test" : "visitor@example.test"));
    return body.password === "test-password-only" ? send(200, session(body.email)) : send(400, { code: "invalid_credentials", msg: "Invalid login credentials" });
  }
  if (url.pathname === "/auth/v1/user") return userId ? send(200, session(isAdmin ? "admin@example.test" : "visitor@example.test").user) : send(401, { message: "Unauthorized" });
  if (url.pathname === "/auth/v1/logout") return send(204);
  if (url.pathname === "/rest/v1/portfolio_admins") return send(200, isAdmin ? [{ user_id: adminId }] : []);
  if (url.pathname === "/rest/v1/portfolio_projects") {
    const matching = (record) => [...url.searchParams].every(([key, value]) => !["id", "visibility", "image_path", "updated_at"].includes(key) || record[key] === value.replace(/^eq\./, ""));
    if (["GET", "HEAD"].includes(request.method)) {
      if (failReads) return send(503, { message: "Test service unavailable" });
      const data = records.filter((record) => (isAdmin || record.visibility === "published") && matching(record)).sort((a, b) => a.sort_order - b.sort_order || b.created_at.localeCompare(a.created_at) || a.id.localeCompare(b.id));
      response.setHeader("Content-Range", `0-${Math.max(0, data.length - 1)}/${data.length}`);
      return send(200, request.method === "HEAD" ? undefined : data);
    }
    if (!isAdmin) return send(403, { code: "42501", message: "RLS denied" });
    if (failWrites) return send(503, { message: "Test save failure" });
    let data = [];
    if (request.method === "POST") {
      const now = new Date().toISOString();
      const record = { ...body, id: randomUUID(), created_at: now, updated_at: now };
      records.push(record); data = [record];
    }
    if (request.method === "PATCH") {
      records = records.map((record) => {
        if (!matching(record)) return record;
        const updated = { ...record, ...body, updated_at: new Date(Date.now() + 1).toISOString() };
        data.push(updated); return updated;
      });
    }
    if (request.method === "DELETE") { data = records.filter(matching); records = records.filter((record) => !matching(record)); }
    return send(200, request.headers.accept?.includes("vnd.pgrst.object") ? data[0] ?? null : data);
  }
  if (url.pathname.startsWith("/storage/v1/object/public/portfolio-images/")) {
    response.setHeader("Content-Type", "image/webp"); response.end(image); return;
  }
  if (url.pathname.startsWith("/storage/v1/object/portfolio-images")) {
    if (!isAdmin) return send(403, { message: "Forbidden" });
    if (request.method === "POST") { const path = url.pathname.replace("/storage/v1/object/portfolio-images/", ""); files.add(path); return send(200, { Key: `portfolio-images/${path}`, Id: randomUUID() }); }
    if (request.method === "DELETE") { for (const path of body.prefixes ?? []) if (!records.some((record) => record.image_path === path)) files.delete(path); return send(200, []); }
  }
  return send(404, { message: "Test endpoint not found" });
}).listen(3111, "127.0.0.1", () => console.log("Supabase test double listening on 127.0.0.1:3111"));
