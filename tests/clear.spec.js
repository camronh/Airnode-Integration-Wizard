const { test, expect } = require("@playwright/test");

test("Clear Works", async ({ page }) => {
  await page.goto("http://localhost:8080/");
  await page.click("#menuButton");
  await page.click("#clear", { force: true });
  expect(await page.isVisible("text=Are you sure")).toBe(false);

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
  await page.click("#menuButton");
  await page.click("#clear");
  await page.click("text=clear");
  expect(await page.isVisible('"Edit your config"')).toBeFalsy();
  const titleValue = await page.$eval("[placeholder='Title']", el => el.value);
  expect(titleValue).toBeFalsy();
});
