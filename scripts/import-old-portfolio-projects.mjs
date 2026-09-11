import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const OLD_ROOT = "/Users/yaroslav/WebstormProjects/portfolio";
const BUCKET = "portfolio-images";
const TABLE = "portfolio_projects";

const projects = [
  {
    name: "V.C.C",
    category_ru: "Fashion web-project",
    category_en: "Fashion web project",
    description_ru: "Fashion web-project в эстетике editorial streetwear. Реализован как digital brand experience с выразительной визуальной подачей, адаптивной вёрсткой и production-деплоем.",
    description_en: "A fashion web project in an editorial streetwear aesthetic, built as a digital brand experience with expressive visuals, responsive layout and production deployment.",
    role_ru: "Frontend-разработка · деплой на VPS",
    role_en: "Frontend development · VPS deployment",
    technologies: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Framer Motion", "Nginx", "VPS"],
    website: "https://viborgclub.fun",
    repository: "",
    image: "vcc-case-optimized.jpg",
    theme: "analytics",
    status: "live",
    sort_order: 10,
  },
  {
    name: "PromoCode Manager",
    category_ru: "Fullstack-консоль",
    category_en: "Fullstack console",
    description_ru: "Административная консоль для управления промокодами, заказами и аналитикой с отдельным operator UI. Проект показывает работу с frontend, API и backend-инфраструктурой.",
    description_en: "An admin console for managing promo codes, orders and analytics with a separate operator UI. The project demonstrates frontend, API and backend infrastructure work.",
    role_ru: "Fullstack-разработка",
    role_en: "Fullstack development",
    technologies: ["React", "Vite", "NestJS", "TypeScript", "MongoDB", "ClickHouse", "Redis", "Docker Compose"],
    website: "",
    repository: "https://github.com/Cherepnya-Yaroslav/Promocode-admin-pannel",
    image: "promocode-manager-optimized.jpg",
    theme: "analytics",
    status: "code",
    sort_order: 20,
  },
  {
    name: "seventyseven",
    category_ru: "Fashion e-commerce",
    category_en: "Fashion e-commerce",
    description_ru: "E-commerce сайт бренда одежды с каталогом, журналом, клиентским сервисом и кастомной визуальной подачей. Работа с CMS, контентом и интерфейсами для продаж.",
    description_en: "A fashion e-commerce website with a catalog, journal, customer service pages and custom visual presentation. CMS, content and sales interface work.",
    role_ru: "Frontend · CMS-интеграция",
    role_en: "Frontend · CMS integration",
    technologies: ["WordPress", "WooCommerce", "WPBakery", "Slider Revolution", "Contact Form 7", "CSS"],
    website: "https://seventysevenworld.com/",
    repository: "",
    image: "seventyseven-world-optimized.jpg",
    theme: "store",
    status: "live",
    sort_order: 30,
  },
  {
    name: "Kodspace",
    category_ru: "Сайт креативного пространства",
    category_en: "Creative space website",
    description_ru: "Сайт для креативного пространства в Санкт-Петербурге: headless CMS, интерактивный календарь, публикации, онлайн-оплата, расписание и форма обратной связи.",
    description_en: "A website for a creative space in Saint Petersburg: headless CMS, interactive calendar, publications, online payments, schedule and contact form.",
    role_ru: "Frontend · интеграция с CMS и API",
    role_en: "Frontend · CMS and API integration",
    technologies: ["React", "Strapi", "REST API", "Headless CMS", "Online payments", "Forms"],
    website: "",
    repository: "https://github.com/Cherepnya-Yaroslav/kod-site",
    image: "kodspace-thumbnail-optimized.jpg",
    theme: "booking",
    status: "code",
    sort_order: 40,
  },
  {
    name: "Heim.",
    category_ru: "Лендинг студии",
    category_en: "Studio landing page",
    description_ru: "Лендинг для студии разработки с адаптивной вёрсткой, аккуратной подачей услуг и формой обратной связи.",
    description_en: "A landing page for a development studio with responsive layout, clear service presentation and a contact form.",
    role_ru: "Frontend-разработка",
    role_en: "Frontend development",
    technologies: ["React", "CSS", "Forms"],
    website: "",
    repository: "",
    image: "heim-landing-optimized.jpg",
    theme: "analytics",
    status: "wip",
    sort_order: 50,
  },
  {
    name: "Cool CRM",
    category_ru: "CRM-система",
    category_en: "CRM system",
    description_ru: "Система управления складом канцтоваров. Учебный проект с backend-логикой, базой данных и интерфейсом для работы с сущностями.",
    description_en: "A stationery warehouse management system. An academic project with backend logic, database work and an interface for managing entities.",
    role_ru: "Fullstack-разработка",
    role_en: "Fullstack development",
    technologies: ["PHP", "MySQL", "HTML", "CSS"],
    website: "",
    repository: "https://github.com/Cherepnya-Yaroslav/crm-profi",
    image: "crm-profi-optimized.jpg",
    theme: "store",
    status: "code",
    sort_order: 60,
  },
  {
    name: "EduPro",
    category_ru: "Лендинг школы",
    category_en: "School landing page",
    description_ru: "Лендинг для школы с адаптивной вёрсткой, структурированной подачей информации и формой обратной связи.",
    description_en: "A school landing page with responsive layout, structured content presentation and a contact form.",
    role_ru: "Frontend-разработка",
    role_en: "Frontend development",
    technologies: ["React", "CSS", "Forms"],
    website: "",
    repository: "",
    image: "school-screen.jpg",
    theme: "booking",
    status: "wip",
    sort_order: 70,
  },
  {
    name: "Поиск жениха!))",
    category_ru: "Event landing",
    category_en: "Event landing page",
    description_ru: "Лендинг для ивент-кампании с адаптивной вёрсткой, простой структурой и формой заявки.",
    description_en: "An event campaign landing page with responsive layout, a simple structure and an application form.",
    role_ru: "Frontend-разработка",
    role_en: "Frontend development",
    technologies: ["React", "CSS", "Forms", "Vercel"],
    website: "https://meetings-landing.vercel.app/",
    repository: "",
    image: "wife-site-optimized.jpg",
    theme: "store",
    status: "live",
    sort_order: 80,
  },
];

function getEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

async function uploadImage(supabase, imageName) {
  const filePath = path.join(OLD_ROOT, "public/images", imageName);
  const bytes = await readFile(filePath);
  const extension = path.extname(imageName).slice(1).toLowerCase();
  const storagePath = `projects/${crypto.randomUUID()}.${extension}`;
  const contentType = extension === "png" ? "image/png" : extension === "webp" ? "image/webp" : "image/jpeg";
  const { error } = await supabase.storage.from(BUCKET).upload(storagePath, bytes, { contentType, upsert: false, cacheControl: "31536000" });
  if (error) throw new Error(`Upload failed for ${imageName}: ${error.message}`);
  return storagePath;
}

const supabaseUrl = getEnv("NEXT_PUBLIC_SUPABASE_URL");
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
if (!supabaseKey) throw new Error("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY is required.");

const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false, autoRefreshToken: false } });
const { error: authError } = await supabase.auth.signInWithPassword({ email: getEnv("IMPORT_ADMIN_EMAIL"), password: getEnv("IMPORT_ADMIN_PASSWORD") });
if (authError) throw new Error(`Auth failed: ${authError.message}`);

const { data: existingRows, error: existingError } = await supabase.from(TABLE).select("id,name,image_path,created_at,updated_at");
if (existingError) throw new Error(`Could not read existing projects: ${existingError.message}`);

const existingByName = new Map((existingRows ?? []).map((row) => [row.name, row]));
const imported = [];
const updated = [];

for (const project of projects) {
  const existing = existingByName.get(project.name);
  const image_path = existing?.image_path || await uploadImage(supabase, project.image);
  const payload = {
    name: project.name,
    category_ru: project.category_ru,
    category_en: project.category_en,
    description_ru: project.description_ru,
    description_en: project.description_en,
    role_ru: project.role_ru,
    role_en: project.role_en,
    alt_ru: `Превью проекта ${project.name}`,
    alt_en: `${project.name} project preview`,
    technologies: project.technologies,
    website: project.website,
    repository: project.repository,
    image_path,
    theme: project.theme,
    status: project.status,
    visibility: "published",
    sort_order: project.sort_order,
    demo: false,
  };

  const query = existing
    ? supabase.from(TABLE).update(payload).eq("id", existing.id)
    : supabase.from(TABLE).insert(payload);
  const { error } = await query.select("id").single();
  if (error) throw new Error(`Save failed for ${project.name}: ${error.message}`);
  (existing ? updated : imported).push(project.name);
}

await supabase.auth.signOut();

console.log(JSON.stringify({ imported, updated, total: imported.length + updated.length }, null, 2));
