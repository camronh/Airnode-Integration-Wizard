const { test, expect } = require("@playwright/test");

test.describe("Bulk", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8080/");
    expect(page.url()).toBe("http://localhost:8080/");
    await page.click("text=Import");
    await page.click("text=Config");
    const exampleOAS = require("../src/utils/exampleConfig.json");
    await page.fill(
      "[placeholder='Paste Import Here...']",
      JSON.stringify(exampleOAS)
    );
    await page.click("[type='submit']");
    await page.click("#endpointMenuButton");
    await page.click("text=Bulk Change");
    expect(await page.waitForSelector("text=Bulk Change")).toBeTruthy();
  });

  test("Bulk add Param works", async ({ page }) => {
    await page.click("text=Add Param");
    await page.type("text=Param Name", "testParam");
    await page.click("text=Bulk Add Param");
    expect(await page.waitForSelector("text=testParam")).toBeTruthy();
  });

  test("Bulk Delete Param works", async ({ page }) => {
    await page.click("text=pairs - query");
    await page.click("text=Del Param");
    await page.click("text=Confirm");
    expect(
      await page.waitForSelector("text=pair - query", { timeout: 1000 })
    ).toBeFalsy();
  });
});
