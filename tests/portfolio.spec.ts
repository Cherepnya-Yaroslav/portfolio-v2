import { expect, test } from "@playwright/test";

for (const locale of ["ru", "en"]) {
  for (const width of [360, 390, 768, 1440, 1920]) {
    test(`${locale}: responsive layout at ${width}px`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(`/${locale}`);
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator(".portrait-image")).toBeVisible();
      const dimensions = await page.evaluate(() => {
        const heading = document.querySelector("h1")!;
        const range = document.createRange();
        range.selectNodeContents(heading);
        const textRect = range.getBoundingClientRect();
        return { viewport: innerWidth, document: document.documentElement.scrollWidth, titleRight: textRect.right, titleLeft: textRect.left };
      });
      expect(dimensions.document).toBeLessThanOrEqual(width);
      expect(dimensions.titleRight).toBeLessThanOrEqual(width);
      expect(dimensions.titleLeft).toBeGreaterThanOrEqual(0);
      await expect(page.locator(".project-card").first()).toBeVisible();
      await page.locator(".project-visual").first().scrollIntoViewIfNeeded();
      await expect.poll(() => page.locator(".project-preview").first().evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
      await page.locator("#contact").scrollIntoViewIfNeeded();
      await expect(page.locator(".contact-row")).toHaveCount(3);
      expect(errors).toEqual([]);
    });
  }
}

test("root redirect, metadata, and unsupported locale", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/ru$/);
  await expect(page).toHaveTitle(/Ярослав/);
  await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", "/en");
  const response = await page.goto("/de");
  expect(response?.status()).toBe(404);
});

test("carousel arrows, keyboard boundaries, and resize preserve position", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/en");
  const previous = page.getByRole("button", { name: "Previous project" });
  const next = page.getByRole("button", { name: "Next project" });
  const counter = page.locator(".slide-counter");
  const track = page.locator(".project-track");
  const total = await page.locator(".project-card").count();
  test.skip(total < 2, "Carousel navigation needs at least two published projects.");
  await expect(previous).toBeDisabled();
  await next.click();
  await expect(counter).toContainText(`02 / ${String(total).padStart(2, "0")}`);
  await track.focus();
  await page.keyboard.press("End");
  await expect(counter).toContainText(`${String(total).padStart(2, "0")} / ${String(total).padStart(2, "0")}`);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(counter).toContainText(`${String(total).padStart(2, "0")} / ${String(total).padStart(2, "0")}`);
  await expect.poll(async () => track.evaluate((element) => Math.abs(element.children[element.children.length - 1].getBoundingClientRect().left - element.getBoundingClientRect().left))).toBeLessThan(3);
  await page.keyboard.press("Home");
  await expect(counter).toContainText(`01 / ${String(total).padStart(2, "0")}`);
  await page.keyboard.press("ArrowRight");
  await expect(counter).toContainText(`02 / ${String(total).padStart(2, "0")}`);
  await page.keyboard.press("End");
  await expect(next).toBeDisabled();
  await page.keyboard.press("ArrowLeft");
  await expect(counter).toContainText(`${String(total - 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`);
});

test("language switching preserves visible section in both directions", async ({ page }) => {
  await page.goto("/ru");
  await page.locator('.main-nav a[href="#projects"]').click();
  await page.locator(".language-switch a[lang=en]").evaluate((element: HTMLAnchorElement) => element.click());
  await expect(page).toHaveURL(/\/en#projects$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page).toHaveTitle(/Yaroslav/);
  await expect.poll(() => page.locator("#projects").evaluate((element) => Math.abs(element.getBoundingClientRect().top))).toBeLessThan(100);
  await page.locator("#contact").scrollIntoViewIfNeeded();
  await page.locator(".language-switch a[lang=ru]").evaluate((element: HTMLAnchorElement) => element.click());
  await expect(page).toHaveURL(/\/ru#contact$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "ru");
});

test("production content, anchors work, and reduced motion is respected", async ({ page }) => {
  await page.goto("/ru");
  await page.keyboard.press("Tab");
  await expect(page.locator(".skip-link")).toBeFocused();
  await page.keyboard.press("Enter");
  await page.locator(".pill-button").click();
  await expect(page).toHaveURL(/#projects$/);
  await expect(page.getByText(/Демо|заглуш|появится позже|Предварительное|Пример стека/i)).toHaveCount(0);
  await expect(page.locator(".contact-row[href]")).toHaveCount(3);
  await expect(page.locator('a[href="#"], a[href=""], button:not([aria-label])')).toHaveCount(0);
  const animation = await page.locator("h1").evaluate((element) => getComputedStyle(element).animationName);
  expect(animation).toBe("none");
  await page.locator(".back-top").click();
  await expect(page).toHaveURL(/#hero$/);
});

test("mobile touch gesture advances carousel", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:3100/en#projects");
  const total = await page.locator(".project-card").count();
  test.skip(total < 2, "Touch gesture needs at least two published projects.");
  await page.locator(".project-visual").first().scrollIntoViewIfNeeded();
  const rect = await page.locator(".project-visual").first().boundingBox();
  const client = await context.newCDPSession(page);
  const y = rect!.y + rect!.height / 2;
  await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 340, y }] });
  for (let x = 320; x >= 60; x -= 20) {
    await client.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y }] });
  }
  await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await expect(page.locator(".slide-counter")).toContainText(`02 / ${String(total).padStart(2, "0")}`);
  await context.close();
});

test("screenshots and full motion have no runtime errors", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/ru");
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => document.getAnimations().filter((animation) => animation.playState === "running").length === 0);
  await page.mouse.move(800, 500);
  await expect.poll(() => page.locator(".portrait-parallax").evaluate((element) => element.style.transform)).toContain("translate3d");
  await page.screenshot({ path: testInfo.outputPath("desktop-hero.png") });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.locator(".project-visual").first().scrollIntoViewIfNeeded();
  await expect.poll(() => page.locator(".project-preview").first().evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
  await page.locator("#hero").scrollIntoViewIfNeeded();
  await page.screenshot({ path: testInfo.outputPath("desktop-full.png"), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: testInfo.outputPath("mobile-full.png"), fullPage: true });
  expect(errors).toEqual([]);
});
