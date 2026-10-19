import { expect, test } from "@playwright/test";

for (const locale of ["ru", "en"]) {
  for (const width of [360, 390, 659, 768, 1440, 1920]) {
    test(`${locale}: pixel portfolio fits ${width}px`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(`/${locale}`);
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("video")).toBeVisible();
      await expect(page.locator(".pf-pixel-identity")).toContainText(
        locale === "ru" ? "AI-разработчик" : "AI developer",
      );
      const dimensions = await page.evaluate(() => {
        const range = document.createRange();
        range.selectNodeContents(document.querySelector("h1")!);
        const rect = range.getBoundingClientRect();
        return {
          width: document.documentElement.scrollWidth,
          left: rect.left,
          right: rect.right,
        };
      });
      expect(dimensions.width).toBeLessThanOrEqual(width);
      expect(dimensions.left).toBeGreaterThanOrEqual(0);
      expect(dimensions.right).toBeLessThanOrEqual(width);
      await page.locator("#about").scrollIntoViewIfNeeded();
      await expect(page.locator(".pf-service h3")).toHaveText([
        "Frontend",
        "Backend",
        "AI",
      ]);
      await page.locator("#contact:visible").scrollIntoViewIfNeeded();
      await expect(page.locator(".pf-contact-list > a[href]")).toHaveCount(3);
      expect(errors).toEqual([]);
    });
  }
}

test("main route uses AI metadata and retires prototype URLs", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/ru$/);
  await expect(page).toHaveTitle("Ярослав Черепня — AI-разработчик");
  await expect(
    page.locator('link[rel="alternate"][hreflang="en"]'),
  ).toHaveAttribute("href", /\/en$/);
  await page.goto("/ru/prototypes?variant=pixel");
  await expect(page).toHaveURL(/\/ru$/);
  await expect(page.locator(".pv-switcher")).toHaveCount(0);
  const response = await page.goto("/de");
  expect(response?.status()).toBe(404);
});

test("outcome-focused copy and separate AI technology group", async ({
  page,
}) => {
  await page.goto("/ru");
  await expect(page.locator("h1")).toContainText("ОТ ИДЕИ");
  await expect(page.locator("h1")).toContainText("ПРОДУКТА");
  await expect(page.locator(".pf-hero-description")).toContainText(
    "Собираю веб-продукты, делаю сервисы, интегрирую AI",
  );
  await expect(
    page
      .locator("#hero")
      .getByText(/пишет код|человеческого упорства|Fullstack/i),
  ).toHaveCount(0);
  const ai = page
    .locator(".pf-service")
    .filter({ has: page.getByRole("heading", { name: "AI", exact: true }) });
  for (const name of ["Codex", "Higgsfield", "RAG", "MCP", "Skills"]) {
    await expect(
      ai.getByRole("listitem").filter({ hasText: new RegExp(`^${name}$`) }),
    ).toHaveCount(1);
  }
});

test("navigation, skip link, contact links and return to top", async ({
  page,
}) => {
  await page.goto("/ru");
  await page.keyboard.press("Tab");
  await expect(page.locator(".skip-link")).toBeFocused();
  await page.keyboard.press("Enter");
  await page
    .getByRole("link", { name: "СМОТРЕТЬ ПРОЕКТЫ", exact: true })
    .click();
  await expect(page).toHaveURL(/#projects$/);
  await page.locator("#contact:visible").scrollIntoViewIfNeeded();
  await expect(page.getByRole("link", { name: /Telegram/ })).toHaveAttribute(
    "href",
    "https://t.me/itstancpol",
  );
  await expect(page.getByRole("link", { name: /Email/ })).toHaveAttribute(
    "href",
    "mailto:cherepnyayar@gmail.com",
  );
  await page.getByRole("link", { name: "Наверх", exact: true }).click();
  await expect(page).toHaveURL(/#hero$/);
});

test("language links retain the visible section", async ({ page }) => {
  await page.goto("/ru#projects");
  await page
    .locator(".pf-language:visible")
    .evaluate((element: HTMLAnchorElement) => element.click());
  await expect(page).toHaveURL(/\/en#projects$/);
  await expect(page).toHaveTitle("Yaroslav Cherepnya — AI Developer");
  await expect
    .poll(() =>
      page
        .locator("#projects:visible")
        .evaluate((element) => Math.abs(element.getBoundingClientRect().top)),
    )
    .toBeLessThan(100);
  await page.locator("#contact:visible").scrollIntoViewIfNeeded();
  await page
    .locator(".pf-language:visible")
    .evaluate((element: HTMLAnchorElement) => element.click());
  await expect(page).toHaveURL(/\/ru#contact$/);
});

test("video scrubs forward, reverses, and respects reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/ru");
  const video = page.locator("video");
  await expect
    .poll(() =>
      video.evaluate((element: HTMLVideoElement) => element.readyState),
    )
    .toBeGreaterThanOrEqual(2);
  await page.evaluate(() => window.scrollTo({ top: 550, behavior: "instant" }));
  await expect
    .poll(() =>
      video.evaluate((element: HTMLVideoElement) => element.currentTime),
    )
    .toBeGreaterThan(2.5);
  await expect
    .poll(() =>
      page
        .locator(".pf-scene-sticky")
        .evaluate((element) => element.getBoundingClientRect().top),
    )
    .toBe(0);
  await page.evaluate(() => window.scrollTo({ top: 100, behavior: "instant" }));
  await expect
    .poll(() =>
      video.evaluate((element: HTMLVideoElement) => element.currentTime),
    )
    .toBeLessThan(1);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect
    .poll(() =>
      video.evaluate((element: HTMLVideoElement) => element.currentTime),
    )
    .toBe(3.75);
  await page.evaluate(() => window.scrollTo({ top: 600, behavior: "instant" }));
  await expect(video).toHaveJSProperty("currentTime", 3.75);
});

test("video failure keeps the page and contact navigation usable", async ({
  page,
}) => {
  await page.route("**/video/laptop-scroll*.mp4*", (route) => route.abort());
  await page.goto("/en");
  await expect(page.locator(".pf-video-status")).toContainText(
    "Video unavailable",
  );
  await expect(page.locator("h1")).toBeVisible();
  await page
    .getByRole("link", { name: "EXPLORE PROJECTS", exact: true })
    .click();
  await expect(page).toHaveURL(/#projects$/);
  await page.locator("#contact:visible").scrollIntoViewIfNeeded();
  await expect(page.locator(".pf-contact-list a")).toHaveCount(3);
});
