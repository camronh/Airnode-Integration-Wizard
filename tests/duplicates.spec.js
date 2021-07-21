const { test, expect } = require("@playwright/test");

test("Export works", async ({ page }) => {
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
  await page.type("#path", "/quote");
  await page.type("#_path", "testPath");

  await page.click("text=Save");
  const quoteEndpoints = await page.$$("text=/quote");
  expect(quoteEndpoints.length).toBe(1);
  await page.click("text=/quote");
  expect(await page.$eval("#_path", el => el.value)).toBe("testPath");
});
