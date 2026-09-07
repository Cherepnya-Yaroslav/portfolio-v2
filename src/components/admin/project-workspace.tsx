"use client";

import { useEffect, useState } from "react";
import { deleteProject, fetchAdminProjects, removeUnusedCover, saveProject } from "@/lib/projects/admin-api";
import { emptyProject, getProjectError, projectStatuses, type ProjectRecord } from "@/lib/projects/schema";
import { ProjectEditor } from "./project-editor";
import { DeleteProjectDialog } from "./delete-project-dialog";

function sortProjects(records: ProjectRecord[]) {
  return [...records].sort((a, b) => a.sort_order - b.sort_order || b.created_at.localeCompare(a.created_at) || a.id.localeCompare(b.id));
}

export function ProjectWorkspace({ email, onSignOut }: { email: string; onSignOut: () => Promise<void> }) {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  const [draftRevision, setDraftRevision] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<ProjectRecord | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const current = projects.find((project) => project.id === selected);

  useEffect(() => {
    let active = true;
    fetchAdminProjects().then((records) => { if (active) { setProjects(records); setLoading(false); } }).catch((error: unknown) => {
      if (active) { setError(getProjectError(error, "Не удалось загрузить проекты. Проверьте подключение.")); setLoading(false); }
    });
    return () => { active = false; };
  }, [revision]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function canLeave() { return !busy && (!dirty || window.confirm("Есть несохранённые изменения. Отменить их?")); }
  function selectProject(id: string | null) {
    if (id === selected && selected !== null) return;
    if (!canLeave()) return;
    setSelected(id); setDirty(false); setError(""); setNotice("");
    if (id === null) setDraftRevision((value) => value + 1);
  }
  function saved(project: ProjectRecord, message: string) {
    setProjects((records) => sortProjects([...records.filter((record) => record.id !== project.id), project]));
    setSelected(project.id); setDirty(false); setNotice(message); setError("");
  }
  async function toggleVisibility(project: ProjectRecord) {
    if (!canLeave()) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const updated = await saveProject({ ...project, visibility: project.visibility === "published" ? "draft" : "published" }, project);
      saved(updated, updated.visibility === "published" ? "Проект опубликован. Он уже доступен на сайте." : "Проект скрыт с сайта и сохранён в черновиках.");
    } catch (error) { setError(getProjectError(error)); }
    finally { setBusy(false); }
  }
  async function confirmDelete() {
    if (!deleting || busy) return;
    setBusy(true); setDeleteError("");
    try {
      await deleteProject(deleting);
      let message = "Проект удалён.";
      if (deleting.image_path) {
        try { await removeUnusedCover(deleting.image_path); }
        catch { message += " Обложку не удалось удалить из хранилища; её можно убрать позднее в Supabase Storage."; }
      }
      setProjects((records) => records.filter((record) => record.id !== deleting.id));
      if (selected === deleting.id) { setSelected(null); setDirty(false); }
      setDeleting(null); setNotice(message);
    } catch (error) { setDeleteError(getProjectError(error, "Не удалось удалить проект. Попробуйте ещё раз.")); }
    finally { setBusy(false); }
  }
  const visible = projects.filter((project) => (filter === "all" || project.visibility === filter) && `${project.name} ${project.category_ru}`.toLowerCase().includes(search.toLowerCase()));
  const published = projects.filter((project) => project.visibility === "published").length;
  const nextOrder = Math.min(100000, Math.max(0, ...projects.map((project) => project.sort_order)) + 10);

  return <main className="admin-workspace"><div className="admin-title-row"><div><span className="admin-kicker">ВАША ПОДБОРКА РАБОТ</span><h1>Проекты<span>.</span></h1><p>{projects.length} всего <span>·</span> {published} опубликовано <span>·</span> {projects.length - published} в черновиках</p></div><div className="admin-account"><span>{email}</span><button className="admin-button secondary compact" disabled={busy} onClick={() => { if (canLeave()) void onSignOut(); }}>Выйти</button></div></div>
    {notice && <p className="admin-message success" role="status">{notice}</p>}
    {error && <p className="admin-message error" role="alert">{error}</p>}
    <div className="admin-columns"><aside className="admin-project-list" aria-label="Список проектов"><div className="admin-list-actions"><button className="admin-button" disabled={busy || loading} onClick={() => selectProject(null)}>+ Новый проект</button><button className="admin-button secondary compact" disabled={busy || loading} onClick={() => {
      if (!canLeave()) return;
      setDirty(false); setSelected(null); setError(""); setLoading(true); setRevision((value) => value + 1);
    }}>Обновить</button></div><label className="admin-search"><span className="sr-only">Поиск проектов</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Найти проект…" /></label><div className="admin-filters" aria-label="Фильтр проектов">{([['all', 'Все'], ['published', 'На сайте'], ['draft', 'Черновики']] as const).map(([value, label]) => <button key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</button>)}</div>
      {loading ? <p className="admin-list-empty" role="status">Загружаем проекты…</p> : visible.length === 0 ? <p className="admin-list-empty">{projects.length ? "По вашему запросу ничего не найдено." : "Здесь появятся ваши работы. Начните с нового проекта."}</p> : <ul>{visible.map((project) => <li key={project.id}><button className={`admin-project-item ${selected === project.id ? "selected" : ""}`} aria-pressed={selected === project.id} disabled={busy} onClick={() => selectProject(project.id)}><span className="admin-item-title">{project.name}<span className="admin-sort-number">{project.sort_order}</span></span><span className="admin-item-meta"><span className={`admin-badge ${project.visibility}`}>{project.visibility === "published" ? "На сайте" : "Черновик"}</span><span>{projectStatuses[project.status]}</span></span></button></li>)}</ul>}
    </aside><section className="admin-editor-panel" aria-label="Редактор проекта">
      {loading ? <p className="admin-list-empty" role="status">Подготавливаем редактор…</p> : <ProjectEditor key={current ? `${current.id}:${current.updated_at}` : `new:${revision}:${projects.length}:${draftRevision}`} initial={current ?? emptyProject(nextOrder)} current={current} disabled={busy} onSaved={saved} onDirtyChange={setDirty} onBusyChange={setBusy} onDelete={current ? () => {
        if (canLeave()) { setDeleteError(""); setDeleting(current); }
      } : undefined} onToggleVisibility={current ? () => toggleVisibility(current) : undefined} />}
    </section></div><DeleteProjectDialog project={deleting} busy={busy} error={deleteError} onCancel={() => { if (!busy) setDeleting(null); }} onConfirm={confirmDelete} /></main>;
}
