import { getBrowserSupabase } from "@/lib/supabase/browser";
import { ADMINS_TABLE, IMAGES_BUCKET, PROJECTS_TABLE } from "@/lib/supabase/config";
import { IMAGE_TYPES, MAX_IMAGE_BYTES, imagePathSchema, projectError, projectInputSchema, projectRowSchema, type ProjectInput, type ProjectRecord } from "./schema";

export async function checkAdminAccess() {
  const supabase = getBrowserSupabase();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw projectError("Сессия истекла. Войдите заново.");
  const { data, error } = await supabase.from(ADMINS_TABLE).select("user_id").eq("user_id", user.id).maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

export async function fetchAdminProjects() {
  const { data, error } = await getBrowserSupabase().from(PROJECTS_TABLE).select("*").order("sort_order").order("created_at", { ascending: false }).order("id");
  if (error) throw error;
  return projectRowSchema.array().parse(data);
}

export async function saveProject(input: ProjectInput, current?: ProjectRecord) {
  const payload = projectInputSchema.parse(input);
  const table = getBrowserSupabase().from(PROJECTS_TABLE);
  const query = current
    ? table.update(payload).eq("id", current.id).eq("updated_at", current.updated_at)
    : table.insert(payload);
  const { data, error } = await query.select("*").maybeSingle();
  if (error) throw error;
  if (!data) throw projectError("Проект изменён в другой вкладке или удалён. Обновите список перед сохранением.");
  return projectRowSchema.parse(data);
}

export async function deleteProject(project: ProjectRecord) {
  const { data, error } = await getBrowserSupabase().from(PROJECTS_TABLE).delete().eq("id", project.id).eq("updated_at", project.updated_at).select("id");
  if (error) throw error;
  if (!data?.length) throw projectError("Проект уже изменён или удалён. Обновите список.");
}

export async function uploadProjectImage(file: File) {
  if (!IMAGE_TYPES.includes(file.type)) throw projectError("Выберите JPG, PNG или WebP.");
  if (!file.size || file.size > MAX_IMAGE_BYTES) throw projectError("Размер обложки должен быть от 1 байта до 5 МБ.");
  let bitmap: ImageBitmap;
  try { bitmap = await createImageBitmap(file); } catch { throw projectError("Файл не удалось прочитать как изображение."); }
  let upload: Blob;
  try {
    const { width, height } = bitmap;
    if (width > 12000 || height > 12000 || width * height > 40_000_000) {
      throw projectError("Размер изображения — не более 12 000 пикселей по стороне и 40 мегапикселей.");
    }
    const scale = Math.min(1, 1920 / Math.max(width, height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw projectError("Браузер не смог обработать обложку. Попробуйте другой браузер.");
    context.imageSmoothingQuality = "high";
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    try {
      const optimized = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => blob ? resolve(blob) : reject(projectError("Не удалось сжать обложку.")), "image/webp", 0.82);
      });
      // Keep a smaller original only when it already fits the dimension budget.
      upload = scale === 1 && file.size <= optimized.size ? file : optimized;
    } finally {
      canvas.width = canvas.height = 0;
    }
  } finally {
    bitmap.close();
  }
  if (upload.size > MAX_IMAGE_BYTES) throw projectError("После сжатия обложка превышает 5 МБ. Выберите изображение меньшего размера.");
  const extension = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }[upload.type];
  if (!extension) throw projectError("Браузер вернул неподдерживаемый формат обложки.");
  const path = `projects/${crypto.randomUUID()}.${extension}`;
  const { error } = await getBrowserSupabase().storage.from(IMAGES_BUCKET).upload(path, upload, { contentType: upload.type, cacheControl: "31536000", upsert: false });
  if (error) throw error;
  return path;
}

export async function removeUnusedCover(path: string) {
  imagePathSchema.parse(path);
  const supabase = getBrowserSupabase();
  const { count, error } = await supabase.from(PROJECTS_TABLE).select("id", { count: "exact", head: true }).eq("image_path", path);
  if (error) throw error;
  if (count !== 0) return;
  const { error: storageError } = await supabase.storage.from(IMAGES_BUCKET).remove([path]);
  if (storageError) throw storageError;
}
