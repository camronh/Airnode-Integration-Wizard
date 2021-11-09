const { test, expect } = require("@playwright/test");

test("Overwrite on duplicate", async ({ page }) => {
  await page.goto("http://localhost:8080/");
  await page.click("#menuButton");

  await page.click("text=Import");
  const exampleOAS = require("../src/utils/exampleConfig.json");
  await page.fill("textarea", JSON.stringify(exampleOAS));
  await page.click("[type='submit']");
  await page.click("text=Add Endpoint");
  await page.type("#path", "/quotes");
  await page.type("#paramName", "testParam");
  await page.keyboard.press("Enter");

  await page.click("#saveEndpoint");
  //   await page.waitForTimeout(999999);
  const quoteEndpoints = await page.$$("text=/quotes");
  expect(quoteEndpoints.length).toBe(1);
  await page.click("text=/quotes");
  expect(await page.waitForSelector("text=testParam")).toBeTruthy();
});

test("Prevent Duplicate Param", async ({ page }) => {
  await page.goto("http://localhost:8080/");

  await page.click("text=Add Endpoint");
  await page.type("#paramName", "TestParam");
  await page.keyboard.press("Enter");
  expect(await page.waitForSelector("text=TestParam")).toBeTruthy();
  await page.type("#paramName", "TestParam");
  await page.keyboard.press("Enter");
  const params = await page.$$("text=TestParam - query");
  expect(params.length).toBe(1);
});
