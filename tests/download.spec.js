const { test, expect } = require("@playwright/test");

test("Export works", async ({ page }) => {
  await page.goto("http://localhost:8080/");
  await page.setViewportSize({ width: 1536, height: 960 });
  await page.click("#menuButton");
  await page.click("text=Import");
  await page.click("text=Config");
  const exampleConfig = require("../src/utils/exampleConfig.json");
  await page.fill(
    "[placeholder='Paste Import Here...']",
    JSON.stringify(exampleConfig)
  );
  await page.click(
    "#app > div.v-dialog__content.v-dialog__content--active > div > div > div.v-card__actions > button"
  );
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
