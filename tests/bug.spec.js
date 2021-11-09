const { test, expect } = require("@playwright/test");

test.describe("Bug Fix", () => {
  test("Clone endpoint modifies both endpoints", async ({ page }) => {
    await page.goto("http://localhost:8080/");
    await page.click("#menuButton");

    await page.click("text=Import");
    const exampleConfig = require("../src/utils/exampleConfig.json");
    await page.fill("textarea", JSON.stringify(exampleConfig));
    await page.click("[type='submit']");

    await page.click("#menuButton");
    await page.click("text=Clone");
    await page.click("text=quotes");
    await page.click("text=Param Name", { force: true });
    await page.keyboard.type("test");
    await page.keyboard.press("Enter");
    await page.dblclick("#path");
    await page.keyboard.type("EndpointName");
    await page.click("#saveEndpoint");
    await page.click("text=quotes");
    expect(await page.isVisible("text=test")).toBeFalsy();
    //   await page.click(
  });

  test("Bug Fix: Bulk Add Param fails the second time", async ({ page }) => {
    await page.goto("http://localhost:8080/");
    await page.click("#menuButton");

    await page.click("text=Import");
    const exampleConfig = require("../src/utils/exampleConfig.json");
    await page.fill("textarea", JSON.stringify(exampleConfig));
    await page.click("[type='submit']");

    await page.click("#menuButton");
    await page.click("text=Bulk");
    await page.click("text=Add Param");
    await page.keyboard.type("Test1");
    await page.click("text=Bulk Add Param");
    expect(await page.isVisible("text=Test1 - query")).toBeTruthy();
    await page.click("text=Add Param");
    await page.type("text=Param Name", "Test2");
    await page.click("text=Bulk Add Param");
    expect(await page.isVisible("text=Test1 - query")).toBeTruthy();
    expect(await page.isVisible("text=Test2 - query")).toBeTruthy();

    //   await page.click(
  });
});
