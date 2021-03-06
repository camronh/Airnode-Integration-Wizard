const { test, expect } = require("@playwright/test");

test.describe("Bulk", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8080/");
    expect(page.url()).toBe("http://localhost:8080/");
    await page.click("#menuButton");

    await page.click("text=Import");
    const exampleOAS = require("../src/utils/exampleConfig.json");
    await page.fill("textarea", JSON.stringify(exampleOAS));
    await page.click("[type='submit']");
    await page.click("#menuButton");
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
    await page.click("text='Delete'");
    expect(await page.isVisible("text=pairs - query")).toBeFalsy();
  });

  test("Bulk Edit Param works", async ({ page }) => {
    await page.click("text=pairs - query");
    await page.click("text=Edit Param");
    await page.type("#paramName", "Testing");
    await page.click("text=Bulk Edit Param");
    expect(
      await page.waitForSelector("text=Testingpairs - query", { timeout: 1000 })
    ).toBeTruthy();
  });
});
