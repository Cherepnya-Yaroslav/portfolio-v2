import { expect, test, type Page } from "@playwright/test";
import path from "node:path";

const backend = "http://127.0.0.1:3111";

async function login(page: Page, email = "admin@example.test") {
  await page.goto("/admin");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Пароль", { exact: true }).fill("test-password-only");
  await page.getByRole("button", { name: "Войти в админку" }).click();
}

async function fillProject(page: Page, name = "Мой проект") {
  await page.locator('[name="name"]').fill(name);
  await page.locator('[name="category_ru"]').fill("Веб-приложение");
  await page.locator('[name="description_ru"]').fill("Разработал интерфейс и серверную часть приложения.");
  await page.locator('[name="role_ru"]').fill("Fullstack-разработчик");
  await page.locator('[name="alt_ru"]').fill("Главный экран приложения");
  await page.locator('[name="technologies"]').fill("React, TypeScript, Node.js");
  await page.locator('[name="cover"]').setInputFiles(path.resolve("public/images/yaroslav.webp"));
}

test.beforeEach(async ({ request }) => { await request.post(`${backend}/__test/reset`); });

test("login errors, access restrictions, and logout", async ({ page }) => {
  await page.goto("/admin");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await page.getByLabel("Email", { exact: true }).fill("admin@example.test");
  await page.getByLabel("Пароль", { exact: true }).fill("incorrect-password");
  await page.getByRole("button", { name: "Войти в админку" }).click();
  await expect(page.locator(".admin-message.error")).toContainText("Не удалось войти");
  await page.getByLabel("Email", { exact: true }).fill("visitor@example.test");
  await page.getByLabel("Пароль", { exact: true }).fill("test-password-only");
  await page.getByRole("button", { name: "Войти в админку" }).click();
  await expect(page.getByRole("heading", { name: "Нужны права администратора." })).toBeVisible();
  await expect(page.locator('[name="name"]')).toHaveCount(0);
  await page.getByRole("button", { name: "Выйти", exact: true }).click();
  await expect(page.getByRole("button", { name: "Войти в админку" })).toBeVisible();
});

test("draft, publish, translation, reload, unpublish, and delete lifecycle", async ({ page, context, request }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await login(page);
  await expect(page.getByRole("heading", { name: "Проекты." })).toBeVisible();
  await page.locator('[name="name"]').fill("Мой проект");
  await page.getByRole("button", { name: "Сохранить черновик" }).click();
  await expect(page.getByRole("status")).toContainText("Черновик сохранён");
  const publicPage = await context.newPage();
  await publicPage.goto("/ru#projects");
  await expect(publicPage.locator(".project-card")).toHaveCount(0);
  await expect(publicPage.getByText("Новые проекты скоро появятся здесь.")).toBeVisible();

  await fillProject(page);
  await page.locator('[name="website"]').fill("https://example.com");
  await page.getByRole("button", { name: "EN", exact: true }).click();
  await page.locator('[name="category_en"]').fill("Web application");
  await page.locator('[name="description_en"]').fill("I built the frontend and backend for this application.");
  await page.locator('[name="role_en"]').fill("Fullstack developer");
  await page.locator('[name="alt_en"]').fill("The application home screen");
  await page.locator('[name="visibility"]').selectOption("published");
  await page.getByRole("button", { name: "Сохранить и опубликовать" }).click();
  await expect(page.getByRole("status")).toContainText("сохранён и опубликован");
  await publicPage.reload();
  await expect(publicPage.locator(".project-card")).toHaveCount(1);
  await expect(publicPage.locator(".project-card h3")).toContainText("Мой проект");
  await expect(publicPage.locator(".project-count")).toHaveText("(01)");
  await expect(publicPage.locator(".project-links a")).toHaveAttribute("href", "https://example.com");
  await publicPage.goto("/en#projects");
  await expect(publicPage.locator(".project-description")).toHaveText("I built the frontend and backend for this application.");
  await expect(publicPage.locator(".role-label")).toHaveText("My role");

  await page.reload();
  await page.locator(".admin-project-item").filter({ hasText: "Мой проект" }).click();
  await expect(page.locator('[name="name"]')).toHaveValue("Мой проект");
  await page.getByRole("button", { name: "Скрыть с сайта", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("скрыт с сайта");
  await publicPage.reload();
  await expect(publicPage.locator(".project-card")).toHaveCount(0);

  await page.getByRole("button", { name: "Удалить проект", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Отмена", exact: true }).click();
  await expect(page.locator(".admin-project-item")).toHaveCount(1);
  await page.getByRole("button", { name: "Удалить проект", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Удалить проект", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Проект удалён.");
  const state = await (await request.get(`${backend}/__test/state`)).json();
  expect(state.records).toHaveLength(0);
  expect(state.files).toHaveLength(0);
  expect(errors).toEqual([]);
});

test("validation, recoverable save error, and unused upload cleanup", async ({ page, request }) => {
  await login(page);
  await page.locator('[name="name"]').fill("Новая работа");
  await page.locator('[name="visibility"]').selectOption("published");
  await page.getByRole("button", { name: "Сохранить и опубликовать" }).click();
  await expect(page.locator(".admin-message.error")).toContainText("Проверьте отмеченные поля");
  await expect(page.locator("#error-description_ru")).toBeVisible();
  await fillProject(page, "Новая работа");
  await page.locator('[name="website"]').fill("javascript:alert(1)");
  await page.getByRole("button", { name: "Сохранить и опубликовать" }).click();
  await expect(page.locator('[name="website"]')).toHaveAttribute("aria-invalid", "true");
  await page.locator('[name="website"]').fill("https://example.com");
  await request.post(`${backend}/__test/failures`, { data: { writes: true } });
  await page.getByRole("button", { name: "Сохранить и опубликовать" }).click();
  await expect(page.locator(".admin-message.error")).toContainText("Не удалось сохранить проект");
  await expect(page.locator('[name="name"]')).toHaveValue("Новая работа");
  const state = await (await request.get(`${backend}/__test/state`)).json();
  expect(state.records).toHaveLength(0);
  expect(state.files).toHaveLength(0);
  await request.post(`${backend}/__test/failures`, { data: {} });
  await page.getByRole("button", { name: "Сохранить и опубликовать" }).click();
  await expect(page.getByRole("status")).toContainText("сохранён и опубликован");
});

test("cover replacement, ordering, English fallback, and admin layouts", async ({ page, context, request }, testInfo) => {
  await login(page);
  await fillProject(page, "Второй проект");
  await page.locator('[name="sort_order"]').fill("200");
  await page.locator('[name="visibility"]').selectOption("published");
  await page.getByRole("button", { name: "Сохранить и опубликовать" }).click();
  await expect(page.getByRole("status")).toContainText("сохранён и опубликован");
  await page.locator('[name="cover"]').setInputFiles(path.resolve("public/images/yaroslav.webp"));
  await page.getByRole("button", { name: "Сохранить и опубликовать" }).click();
  await expect(page.getByRole("status")).toContainText("сохранён и опубликован");
  await page.getByRole("button", { name: "+ Новый проект" }).click();
  await fillProject(page, "Первый проект");
  await page.locator('[name="sort_order"]').fill("0");
  await page.locator('[name="visibility"]').selectOption("published");
  await page.getByRole("button", { name: "Сохранить и опубликовать" }).click();
  await expect(page.getByRole("status")).toContainText("сохранён и опубликован");
  const state = await (await request.get(`${backend}/__test/state`)).json();
  expect(state.files).toHaveLength(2);
  const publicPage = await context.newPage();
  await publicPage.goto("/en#projects");
  await expect(publicPage.locator(".project-card h3").first()).toContainText("Первый проект");
  await expect(publicPage.locator(".project-description").first()).toHaveText("Разработал интерфейс и серверную часть приложения.");
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: testInfo.outputPath("admin-desktop.png"), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  await page.screenshot({ path: testInfo.outputPath("admin-mobile.png"), fullPage: true });
});

test("empty/error public states and retry", async ({ page, request }) => {
  await request.post(`${backend}/__test/failures`, { data: { reads: true } });
  await page.goto("/ru#projects");
  await expect(page.getByText("Не удалось загрузить проекты. Попробуйте чуть позже.")).toBeVisible();
  await expect(page.locator(".project-card")).toHaveCount(0);
  await request.post(`${backend}/__test/failures`, { data: {} });
  await page.getByRole("button", { name: "Попробовать снова ↗" }).click();
  await expect(page.getByText("Новые проекты скоро появятся здесь.")).toBeVisible();
});

test("concurrent edit does not overwrite a newer saved version", async ({ page, context }) => {
  await login(page);
  await page.locator('[name="name"]').fill("Оригинал");
  await page.getByRole("button", { name: "Сохранить черновик" }).click();
  await expect(page.getByRole("status")).toContainText("Черновик сохранён");
  const other = await context.newPage();
  await other.goto("/admin");
  await other.locator(".admin-project-item").filter({ hasText: "Оригинал" }).click();
  await other.locator('[name="name"]').fill("Новая версия");
  await other.getByRole("button", { name: "Сохранить черновик" }).click();
  await expect(other.getByRole("status")).toContainText("Черновик сохранён");
  await page.locator('[name="name"]').fill("Устаревшая версия");
  await page.getByRole("button", { name: "Сохранить черновик" }).click();
  await expect(page.locator(".admin-message.error")).toContainText("изменён в другой вкладке");
  page.once("dialog", (dialog) => dialog.accept());
  await page.locator('.admin-project-list button').filter({ hasText: "Обновить" }).click();
  await expect(page.locator(".admin-project-item")).toContainText("Новая версия");
});
