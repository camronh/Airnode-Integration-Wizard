const { test, expect } = require("@playwright/test");

test("Parse request body variables", async ({ page }) => {
  await page.goto("http://localhost:8080/");
  await page.click("#menuButton");

  await page.click("text=Import");
  const exampleOAS = require("../src/utils/requestBodyOAS.json");
  await page.fill("textarea", JSON.stringify(exampleOAS));
  await page.click("[type='submit']");

  const value = await page.$eval("[placeholder='Title']", el => el.value);
  expect(value).toContain("climateKuul");
  await page.click("text=ecommerceDelivery");
  expect(await page.isVisible("text=waybill_type")).toBeTruthy();
});
