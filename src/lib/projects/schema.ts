import { z } from "zod";
import type { Project } from "@/content/portfolio";

export const projectStatuses = { live: "Онлайн", code: "Исходный код", wip: "В разработке" } as const;
export const projectThemes = { store: "Оливковый", analytics: "Фиолетовый", booking: "Мятный" } as const;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const shortText = z.string().trim().max(120, "Максимум 120 символов.");
const description = z.string().trim().max(4000, "Максимум 4000 символов.");
const link = z.string().trim().max(2048).refine((value) => {
  if (!value) return true;
  try { const url = new URL(value); return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password; } catch { return false; }
}, "Укажите полный адрес с https:// или http://.");

export const imagePathSchema = z.string().regex(/^projects\/[0-9a-f-]{36}\.(?:jpg|png|webp)$/, "Недопустимый путь обложки.");

const projectFields = z.object({
  name: shortText.min(1, "Введите название проекта."),
  category_ru: shortText,
  category_en: shortText,
  description_ru: description,
  description_en: description,
  role_ru: shortText,
  role_en: shortText,
  alt_ru: z.string().trim().max(300),
  alt_en: z.string().trim().max(300),
  technologies: z.array(z.string().trim().min(1).max(40)).max(20, "Не более 20 технологий."),
  website: link,
  repository: link,
  image_path: imagePathSchema.nullable(),
  theme: z.enum(["store", "analytics", "booking"]),
  status: z.enum(["live", "code", "wip"]),
  visibility: z.enum(["draft", "published"]),
  sort_order: z.number().int().min(0).max(100000),
  demo: z.boolean(),
});

export const projectInputSchema = projectFields.superRefine((project, context) => {
  if (project.visibility !== "published") return;
  const required = { category_ru: "Укажите категорию.", description_ru: "Добавьте описание.", role_ru: "Укажите свою роль.", alt_ru: "Опишите обложку для доступности.", image_path: "Загрузите обложку." } as const;
  for (const [field, message] of Object.entries(required)) {
    if (!project[field as keyof typeof required]) context.addIssue({ code: "custom", path: [field], message });
  }
});

export const projectRowSchema = projectFields.extend({
  id: z.uuid(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type ProjectInput = z.infer<typeof projectFields>;
export type ProjectRecord = z.infer<typeof projectRowSchema>;

export function emptyProject(sortOrder = 100): ProjectInput {
  return { name: "", category_ru: "", category_en: "", description_ru: "", description_en: "", role_ru: "", role_en: "", alt_ru: "", alt_en: "", technologies: [], website: "", repository: "", image_path: null, theme: "analytics", status: "live", visibility: "draft", sort_order: sortOrder, demo: false };
}

export function toPublicProject(row: ProjectRecord, preview: string): Project {
  return {
    id: row.id, name: row.name, preview, theme: row.theme, technologies: row.technologies,
    demo: row.demo, status: row.status, website: row.website || undefined, repository: row.repository || undefined,
    text: {
      ru: { category: row.category_ru, description: row.description_ru, role: row.role_ru, alt: row.alt_ru },
      en: { category: row.category_en || row.category_ru, description: row.description_en || row.description_ru, role: row.role_en || row.role_ru, alt: row.alt_en || row.alt_ru },
    },
  };
}

export function getProjectError(error: unknown, fallback = "Не удалось выполнить действие. Попробуйте ещё раз.") {
  if (error instanceof z.ZodError) return error.issues[0]?.message ?? fallback;
  if (error && typeof error === "object" && "code" in error) {
    if (["42501", "PGRST301"].includes(String(error.code))) return "Нет прав на изменение проектов. Войдите как администратор.";
    if (["42P01", "PGRST205"].includes(String(error.code))) return "Таблицы ещё не настроены. Выполните SQL из инструкции подключения.";
    if (String(error.code) === "23514") return "Проверьте поля: для публикации нужны описание, категория, роль и обложка.";
  }
  if (error instanceof Error && error.name === "ProjectError") return error.message;
  return fallback;
}

export function projectError(message: string) {
  const error = new Error(message);
  error.name = "ProjectError";
  return error;
}
