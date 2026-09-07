"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import Link from "next/link";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { checkAdminAccess } from "@/lib/projects/admin-api";
import { getProjectError } from "@/lib/projects/schema";
import { ProjectWorkspace } from "./project-workspace";
import { ArrowIcon } from "../icons";

function AdminHeader() {
  return <header className="admin-header"><Link className="wordmark" href="/ru" aria-label="Портфолио Ярослава">ya<span>.</span></Link><span className="admin-header-label">УПРАВЛЕНИЕ ПОРТФОЛИО</span><a className="admin-site-link" href="/ru" target="_blank" rel="noopener noreferrer">Открыть сайт<ArrowIcon /></a></header>;
}

function SetupNotice() {
  return <main className="admin-entry"><span className="admin-kicker">ПЕРВОЕ ПОДКЛЮЧЕНИЕ</span><h1>Место для<br /><span>ваших проектов.</span></h1><p>Редактор готов. Подключите новый проект Supabase, чтобы войти и публиковать работы.</p><ol className="admin-setup-steps"><li>Создайте проект в Supabase и выполните SQL из инструкции <code>docs/admin-setup.md</code>.</li><li>Добавьте Project URL и публичный ключ в локальные настройки приложения.</li><li>Создайте пользователя, назначьте его администратором и перезапустите сайт.</li></ol><p className="admin-footnote">Данные старого портфолио не затрагиваются. Пока подключение не настроено, на сайте показаны демопроекты.</p><a className="admin-button" href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer">Открыть Supabase<ArrowIcon /></a></main>;
}

function LoginForm() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    setError("");
    setBusy(true);
    try {
      const { error } = await getBrowserSupabase().auth.signInWithPassword({ email: String(data.get("email")).trim(), password: String(data.get("password")) });
      if (error) {
        setError(error.status === 429 ? "Слишком много попыток. Подождите немного и попробуйте снова." : "Не удалось войти. Проверьте email, пароль и подключение к сети.");
      } else form.reset();
    } catch { setError("Не удалось связаться с сервером. Попробуйте ещё раз."); }
    finally { setBusy(false); }
  }
  return <main className="admin-entry"><span className="admin-kicker">ЛИЧНЫЙ КАБИНЕТ</span><h1>Хорошие проекты<br /><span>стоят внимания.</span></h1><p>Войдите, чтобы добавить новую работу или обновить портфолио.</p><form className="admin-login-form" onSubmit={signIn}><label>Email<input name="email" type="email" autoComplete="username" required maxLength={254} placeholder="you@example.com" disabled={busy} /></label><label>Пароль<input name="password" type="password" autoComplete="current-password" required maxLength={128} placeholder="Ваш пароль" disabled={busy} /></label>{error && <p className="admin-message error" role="alert">{error}</p>}<button className="admin-button" disabled={busy}>{busy ? "Входим…" : "Войти в админку"}<ArrowIcon /></button></form><p className="admin-footnote">Вход только для администраторов. Публичной регистрации нет.</p></main>;
}

function AdminSession({ session, onSignOut }: { session: Session; onSignOut: () => Promise<void> }) {
  const [status, setStatus] = useState<"checking" | "allowed" | "denied" | "error">("checking");
  const [message, setMessage] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    checkAdminAccess().then((allowed) => { if (active) setStatus(allowed ? "allowed" : "denied"); }).catch((error: unknown) => {
      if (active) { setMessage(getProjectError(error, "Не удалось проверить доступ. Проверьте подключение и настройку базы.")); setStatus("error"); }
    });
    return () => { active = false; };
  }, [attempt, session.user.id]);
  if (status === "allowed") return <ProjectWorkspace email={session.user.email ?? "Администратор"} onSignOut={onSignOut} />;
  if (status === "checking") return <main className="admin-entry" role="status"><p>Проверяем доступ…</p></main>;
  return <main className="admin-entry"><span className="admin-kicker">ДОСТУП К ПОРТФОЛИО</span><h1>{status === "denied" ? "Нужны права администратора." : "Не удалось подключиться."}</h1><p role="alert">{status === "denied" ? "Этот аккаунт пока не назначен администратором нового портфолио. Добавьте его User ID в список администраторов по инструкции подключения." : message}</p><div className="admin-actions"><button className="admin-button" onClick={() => { setStatus("checking"); setAttempt((value) => value + 1); }}>Проверить снова</button><button className="admin-button secondary" onClick={onSignOut}>Выйти</button></div></main>;
}

function ConnectedAdmin() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    const client = getBrowserSupabase();
    client.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      setSession(data.session);
      if (error) setError("Не удалось восстановить сессию. Войдите заново.");
      setLoading(false);
    }).catch(() => { if (active) { setError("Не удалось восстановить сессию."); setLoading(false); } });
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, next) => {
      if (active) { setSession(next); setLoading(false); setError(""); }
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);
  async function signOut() {
    try {
      const { error } = await getBrowserSupabase().auth.signOut({ scope: "local" });
      if (error) { setError("Не удалось выйти. Проверьте подключение и попробуйте ещё раз."); return; }
      setSession(null);
    } catch { setError("Не удалось выйти. Попробуйте ещё раз."); }
  }
  return <>{error && <p className="admin-message error admin-session-error" role="alert">{error}</p>}{loading ? <main className="admin-entry" role="status"><p>Восстанавливаем сессию…</p></main> : session ? <AdminSession key={session.user.id} session={session} onSignOut={signOut} /> : <LoginForm />}</>;
}

export function AdminPanel() {
  return <><AdminHeader />{getSupabaseConfig() ? <ConnectedAdmin /> : <SetupNotice />}</>;
}
