import { expect, test } from "@playwright/test";
import { emptyProject, projectInputSchema, toPublicProject, type ProjectRecord } from "../src/lib/projects/schema";

test("drafts can be incomplete but publication requires real content and a cover", () => {
  const draft = { ...emptyProject(0), name: "Test" };
  expect(projectInputSchema.safeParse(draft).success).toBe(true);
  const published = projectInputSchema.safeParse({ ...draft, visibility: "published" });
  expect(published.success).toBe(false);
  if (!published.success) expect(published.error.issues.map((issue) => issue.path[0])).toEqual(expect.arrayContaining(["description_ru", "category_ru", "role_ru", "alt_ru", "image_path"]));
});

test("unsafe links, invalid order, excessive tags, and storage traversal are rejected", () => {
  const draft = { ...emptyProject(), name: "Test" };
  for (const website of ["javascript:alert(1)", "data:text/html,test", "//evil.example", "https://user:password@example.com"]) {
    expect(projectInputSchema.safeParse({ ...draft, website }).success).toBe(false);
  }
  expect(projectInputSchema.safeParse({ ...draft, website: "https://example.com/path?q=1" }).success).toBe(true);
  expect(projectInputSchema.safeParse({ ...draft, sort_order: 0 }).success).toBe(true);
  expect(projectInputSchema.safeParse({ ...draft, sort_order: -1 }).success).toBe(false);
  expect(projectInputSchema.safeParse({ ...draft, sort_order: 1.5 }).success).toBe(false);
  expect(projectInputSchema.safeParse({ ...draft, image_path: "../other-bucket/file.webp" }).success).toBe(false);
  expect(projectInputSchema.safeParse({ ...draft, technologies: Array(21).fill("React") }).success).toBe(false);
});

test("partial English translations fall back per field, with no demo mislabelling", () => {
  const record: ProjectRecord = { ...emptyProject(), id: "11111111-1111-4111-8111-111111111111", name: "Test", category_ru: "Категория", description_ru: "Описание", description_en: "Description", role_ru: "Разработка", alt_ru: "Экран", created_at: "2026-09-07T00:00:00Z", updated_at: "2026-09-07T00:00:00Z" };
  const project = toPublicProject(record, "https://example.com/cover.webp");
  expect(project.text.en).toEqual({ category: "Категория", description: "Description", role: "Разработка", alt: "Экран" });
  expect(project.demo).toBe(false);
  expect(project.website).toBeUndefined();
});
