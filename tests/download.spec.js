const { test, expect } = require("@playwright/test");

test("Export works", async ({ page }) => {
  await page.goto("http://localhost:8080/");
  await page.setViewportSize({ width: 1536, height: 960 });
  await page.click("#menuButton");
  await page.click("text=Import");
  const exampleConfig = require("../src/utils/exampleConfig.json");
  await page.fill("textarea", JSON.stringify(exampleConfig));
  await page.click("[type='submit']");

  const titleValue = await page.$eval("[placeholder='Title']", el => el.value);
  expect(titleValue).toContain("Forge");

  const RPCValue = await page.$eval("#rpcURL", el => el.value);
  expect(RPCValue).toContain("https://");
  await page.click("#menuButton");

  await page.click("text=Export");
  await page.waitForTimeout(500);
  await page.click("text=Download", { force: true });
  expect(await page.waitForSelector("text=Download Options")).toBeTruthy();
});
