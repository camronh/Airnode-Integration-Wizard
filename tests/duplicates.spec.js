const { test, expect } = require("@playwright/test");

test("Overwrite on duplicate", async ({ page }) => {
  await page.goto("http://localhost:8080/");
  await page.click("text=Import");
  await page.click("text=Config");
  const exampleOAS = require("../src/utils/exampleConfig.json");
  await page.fill(
    "[placeholder='Paste Import Here...']",
    JSON.stringify(exampleOAS)
  );
  await page.click("[type='submit']");
  await page.click("text=Add Endpoint");
  await page.type("#path", "/quotes");
  await page.type("#paramName", "testParam");
  await page.keyboard.press("Enter");

  await page.click("text=Save");
  //   await page.waitForTimeout(999999);
  const quoteEndpoints = await page.$$("text=/quotes");
  expect(quoteEndpoints.length).toBe(1);
  await page.click("text=/quotes");
  expect(await page.waitForSelector("text=testParam")).toBeTruthy();
});
