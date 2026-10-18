import { expect, test } from "@playwright/test";

test("published snapshot serves real projects and their covers", async ({ page, request }) => {
  test.skip(process.env.PROJECTS_SOURCE !== "snapshot", "Requires the deployment project source.");
  await page.goto("/ru");
  const projects = page.locator(".pf-project");
  await expect(projects).toHaveCount(8);
  await expect(projects.locator("h3")).toHaveText([
    "Ай хелпер.", "Kodspace.", "seventyseven.", "V.C.C.",
    "PromoCode Manager.", "Heim..", "Cool CRM.", "EduPro.",
  ]);
  await expect(page.locator(".pf-demo-label")).toHaveCount(0);
  await expect(projects.filter({ has: page.getByRole("heading", { name: "V.C.C.", exact: true }) }).getByRole("link")).toHaveAttribute("href", "https://github.com/Cherepnya-Yaroslav/V.C.C");
  const covers = await projects.locator("img").evaluateAll((images) => images.map((image) => image.getAttribute("src")!));
  for (const cover of covers) {
    const response = await request.get(cover);
    expect(response.ok(), cover).toBe(true);
    expect(response.headers()["content-type"]).toMatch(/^image\//);
  }
});
