"use client";

import { useEffect, useRef } from "react";
import type { ProjectRecord } from "@/lib/projects/schema";

export function DeleteProjectDialog({ project, busy, error, onCancel, onConfirm }: { project: ProjectRecord | null; busy: boolean; error: string; onCancel: () => void; onConfirm: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (project && !ref.current?.open) ref.current?.showModal();
    if (!project && ref.current?.open) ref.current?.close();
  }, [project]);
  return <dialog ref={ref} className="admin-dialog" aria-labelledby="delete-title" onCancel={(event) => { event.preventDefault(); if (!busy) onCancel(); }}><h2 id="delete-title">Удалить проект?</h2><p>«{project?.name}» исчезнет из портфолио и админки. Это действие нельзя отменить.</p>{error && <p role="alert" className="admin-message error">{error}</p>}<div className="admin-actions"><button type="button" className="admin-button secondary" disabled={busy} onClick={onCancel} autoFocus>Отмена</button><button type="button" className="admin-button danger" disabled={busy} onClick={onConfirm}>{busy ? "Удаляем…" : "Удалить проект"}</button></div></dialog>;
}
