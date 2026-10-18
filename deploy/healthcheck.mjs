const origin = process.env.HEALTHCHECK_ORIGIN || "http://127.0.0.1:3000";

async function get(path, headers = {}) {
  const response = await fetch(new URL(path, origin), {
    headers,
    signal: AbortSignal.timeout(45000),
  });
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
  return response;
}

let ready = false;
for (let attempt = 0; attempt < 30; attempt++) {
  try {
    await get("/admin");
    ready = true;
    break;
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}
if (!ready) throw new Error("Application did not become ready");

for (const locale of ["ru", "en"]) {
  const html = await (await get(`/${locale}`)).text();
  if (!html.includes(`<html lang="${locale}"`) || !html.includes('<h1 id="hero-title"')) {
    throw new Error(`/${locale}: portfolio content is missing`);
  }
  if (html.includes('Не удалось загрузить проекты.') || html.includes('Projects could not be loaded.')) {
    throw new Error(`/${locale}: projects failed to load`);
  }
  console.log(`/${locale}: portfolio ready`);
}

const video = await get("/video/laptop-scroll.mp4", { Range: "bytes=0-1023" });
if (video.status !== 206 || (await video.arrayBuffer()).byteLength !== 1024) {
  throw new Error("Scroll video does not support partial loading");
}
console.log("Admin and scroll video ready");
