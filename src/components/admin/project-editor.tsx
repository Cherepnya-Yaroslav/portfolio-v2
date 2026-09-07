"use client";

import Image from "next/image";
import { useEffect, useState, type FormEvent } from "react";
import { getCoverUrl } from "@/lib/supabase/config";
import { removeUnusedCover, saveProject, uploadProjectImage } from "@/lib/projects/admin-api";
import { IMAGE_TYPES, MAX_IMAGE_BYTES, getProjectError, projectInputSchema, projectStatuses, projectThemes, type ProjectInput, type ProjectRecord } from "@/lib/projects/schema";

type Props = {
  initial: ProjectInput;
  current?: ProjectRecord;
  disabled: boolean;
  onSaved: (project: ProjectRecord, message: string) => void;
  onDirtyChange: (dirty: boolean) => void;
  onBusyChange: (busy: boolean) => void;
  onDelete?: () => void;
  onToggleVisibility?: () => void;
};

const translationFields = [
  { key: "category", label: "Категория", hint: "Например, интернет-магазин", limit: 120 },
  { key: "description", label: "Описание", hint: "Что это за проект, какую задачу он решает и что вы сделали", limit: 4000 },
  { key: "role", label: "Ваша роль", hint: "Например, Fullstack · Разработка приложения", limit: 120 },
  { key: "alt", label: "Описание обложки", hint: "Короткое описание изображения для скринридеров", limit: 300 },
] as const;

export function ProjectEditor({ initial, current, disabled, onSaved, onDirtyChange, onBusyChange, onDelete, onToggleVisibility }: Props) {
  const [form, setForm] = useState<ProjectInput>(initial);
  const [technologies, setTechnologies] = useState(initial.technologies.join(", "));
  const [language, setLanguage] = useState<"ru" | "en">("ru");
  const [file, setFile] = useState<File | null>(null);
  const [blobUrl, setBlobUrl] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>( {} );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const cover = blobUrl || getCoverUrl(form.image_path);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    // Object URLs stay local until the project is explicitly saved.
    const frame = requestAnimationFrame(() => setBlobUrl(url));
    return () => { cancelAnimationFrame(frame); URL.revokeObjectURL(url); };
  }, [file]);

  function update<K extends keyof ProjectInput>(key: K, value: ProjectInput[K]) {
    setForm((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: "" }));
    onDirtyChange(true);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (disabled || saving) return;
    setError("");
    const input = { ...form, technologies: [...new Set(technologies.split(/[,\n]/).map((value) => value.trim()).filter(Boolean))] };
    const validation = projectInputSchema.safeParse({ ...input, image_path: file ? "projects/00000000-0000-4000-8000-000000000000.webp" : input.image_path });
    if (!validation.success) {
      setErrors(Object.fromEntries(validation.error.issues.map((issue) => [String(issue.path[0]), issue.message])));
      if (validation.error.issues.some((issue) => String(issue.path[0]).endsWith("_ru"))) setLanguage("ru");
      setError("Проверьте отмеченные поля. Для публикации заполните русскую версию и добавьте обложку.");
      return;
    }
    setErrors({}); setSaving(true); onBusyChange(true);
    let uploadedPath: string | null = null;
    try {
      if (file) uploadedPath = await uploadProjectImage(file);
      const saved = await saveProject({ ...validation.data, image_path: uploadedPath ?? input.image_path }, current);
      uploadedPath = null;
      let message = saved.visibility === "published" ? "Проект сохранён и опубликован. Он уже доступен на сайте." : "Черновик сохранён. Посетители его не видят.";
      if (current?.image_path && current.image_path !== saved.image_path) {
        try { await removeUnusedCover(current.image_path); }
        catch { message += " Старую обложку не удалось убрать из Storage; её можно удалить позднее."; }
      }
      onSaved(saved, message);
    } catch (error) {
      let message = getProjectError(error, "Не удалось сохранить проект. Изменения остались в редакторе — попробуйте снова.");
      if (uploadedPath) {
        try { await removeUnusedCover(uploadedPath); }
        catch { message += " Неиспользуемая обложка осталась в Storage."; }
      }
      setError(message);
    } finally { setSaving(false); onBusyChange(false); }
  }

  const previewText = (field: "category" | "description" | "role") => form[`${field}_${language}`] || form[`${field}_ru`];

  return <form className="admin-editor" onSubmit={submit} noValidate>
    <div className="admin-editor-heading"><div><span className="admin-kicker">{current ? "РЕДАКТИРОВАНИЕ" : "НОВАЯ РАБОТА"}</span><h2>{current ? current.name : "Расскажите о проекте"}</h2></div>{current && <span className={`admin-badge ${current.visibility}`}>{current.visibility === "published" ? "Опубликован" : "Черновик"}</span>}</div>
    {error && <p className="admin-message error" role="alert">{error}</p>}
    <fieldset disabled={disabled} className="admin-fields">
      <label>Название проекта<input name="name" value={form.name} onChange={(event) => update("name", event.target.value)} maxLength={120} placeholder="Название вашей работы" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "error-name" : undefined} />{errors.name && <span id="error-name" className="admin-field-error">{errors.name}</span>}</label>
      <div className="admin-translation-heading"><h3>Тексты карточки</h3><div className="admin-language-tabs" aria-label="Язык редактирования"><button type="button" aria-pressed={language === "ru"} onClick={() => setLanguage("ru")}>RU</button><button type="button" aria-pressed={language === "en"} onClick={() => setLanguage("en")}>EN</button></div></div>
      <p className="admin-field-hint">Русская версия обязательна для публикации. Пустые поля EN используют текст RU.</p>
      {translationFields.map(({ key, label, hint, limit }) => {
        const field = `${key}_${language}` as const;
        const shared = { name: field, value: form[field], onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => update(field, event.target.value), maxLength: limit, placeholder: hint, "aria-invalid": Boolean(errors[field]), "aria-describedby": errors[field] ? `error-${field}` : undefined };
        return <label key={field}>{label} <span className="admin-language-marker">{language.toUpperCase()}</span>{key === "description" ? <textarea {...shared} rows={4} /> : <input {...shared} />}{errors[field] && <span className="admin-field-error" id={`error-${field}`}>{errors[field]}</span>}</label>;
      })}
      <label>Технологии<input name="technologies" value={technologies} onChange={(event) => { setTechnologies(event.target.value); onDirtyChange(true); }} placeholder="React, TypeScript, Node.js" maxLength={1000} aria-invalid={Boolean(errors.technologies)} /><span className="admin-field-hint">Через запятую, до 20 технологий.</span>{errors.technologies && <span className="admin-field-error">{errors.technologies}</span>}</label>
      <div className="admin-form-grid"><label>Ссылка на сайт<input name="website" type="url" value={form.website} onChange={(event) => update("website", event.target.value)} maxLength={2048} placeholder="https://your-project.com" aria-invalid={Boolean(errors.website)} />{errors.website && <span className="admin-field-error">{errors.website}</span>}</label><label>Ссылка на код<input name="repository" type="url" value={form.repository} onChange={(event) => update("repository", event.target.value)} maxLength={2048} placeholder="https://github.com/…" aria-invalid={Boolean(errors.repository)} />{errors.repository && <span className="admin-field-error">{errors.repository}</span>}</label></div>
      <div className="admin-cover-section"><h3>Обложка</h3><label className="admin-upload"><span>{file ? file.name : "Выбрать изображение"}</span><input name="cover" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => {
        const next = event.target.files?.[0];
        if (!next) return;
        if (!IMAGE_TYPES.includes(next.type) || !next.size || next.size > MAX_IMAGE_BYTES) {
          setErrors((previous) => ({ ...previous, image_path: "Выберите JPG, PNG или WebP размером до 5 МБ." }));
          event.target.value = ""; return;
        }
        setFile(next); setErrors((previous) => ({ ...previous, image_path: "" })); onDirtyChange(true);
      }} /><small>JPG, PNG или WebP · до 5 МБ · рекомендуем 1600 × 1000</small></label>{file && <button type="button" className="admin-text-button" onClick={() => { setFile(null); setBlobUrl(""); }}>Отменить замену обложки</button>}{errors.image_path && <p className="admin-field-error" role="alert">{errors.image_path}</p>}</div>
      <div className="admin-form-grid three"><label>Цвет подложки<select name="theme" value={form.theme} onChange={(event) => update("theme", event.target.value as ProjectInput["theme"])}>{Object.entries(projectThemes).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label><label>Состояние проекта<select name="status" value={form.status} onChange={(event) => update("status", event.target.value as ProjectInput["status"])}>{Object.entries(projectStatuses).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label><label>Порядок<input name="sort_order" type="number" min={0} max={100000} value={form.sort_order} onChange={(event) => update("sort_order", Number(event.target.value))} aria-invalid={Boolean(errors.sort_order)} />{errors.sort_order && <span className="admin-field-error">{errors.sort_order}</span>}</label></div><p className="admin-field-hint">Чем меньше число порядка, тем раньше проект в карусели.</p>
      <label className="admin-checkbox"><input name="demo" type="checkbox" checked={form.demo} onChange={(event) => update("demo", event.target.checked)} />Это демонстрационный концепт</label>
      <details className="admin-preview" open><summary>Предпросмотр · {language.toUpperCase()}</summary><div className={`admin-preview-cover ${form.theme}`}>{cover ? <Image src={cover} alt={form[`alt_${language}`] || form.alt_ru || "Предпросмотр обложки"} width={800} height={500} unoptimized /> : <span>Здесь будет обложка проекта</span>}</div><p className="admin-preview-category">{previewText("category") || "Категория проекта"}</p><h3>{form.name || "Название проекта"}<span>.</span></h3><p className="admin-preview-description">{previewText("description") || "Описание появится здесь, когда вы заполните поля выше."}</p><span className="admin-preview-role">{previewText("role")}</span></details>
      <div className="admin-publish-row"><label>Видимость<select name="visibility" value={form.visibility} onChange={(event) => update("visibility", event.target.value as ProjectInput["visibility"])}><option value="draft">Черновик — виден только вам</option><option value="published">Опубликован — виден на сайте</option></select></label><button type="submit" className="admin-button">{saving ? "Сохраняем…" : form.visibility === "published" ? "Сохранить и опубликовать" : "Сохранить черновик"}</button></div>
    </fieldset>
    {current && <div className="admin-editor-bottom"><button type="button" className="admin-text-button" disabled={disabled} onClick={onToggleVisibility}>{current.visibility === "published" ? "Скрыть с сайта" : "Опубликовать сохранённую версию"}</button><button type="button" className="admin-text-button danger" disabled={disabled} onClick={onDelete}>Удалить проект</button></div>}
  </form>;
}
