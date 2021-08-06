const { test, expect } = require("@playwright/test");

test("Clear Works", async ({ page }) => {
  await page.goto("http://localhost:8080/");
  await page.click("#menuButton");
  await page.click("#clear");
  expect(await page.waitForSelector("text=Are you sure")).toBeTruthy();
  await page.click("text=close");
  await page.click("#menuButton");

  await page.click("text=Import");
  const exampleConfig = require("../src/utils/exampleConfig.json");
  await page.fill(
    "textarea",
    JSON.stringify(exampleConfig)
  );
  await page.click(
    "#app > div.v-dialog__content.v-dialog__content--active > div > div > div.v-card__actions > button"
  );
  await page.click("#menuButton");
  await page.click("#clear");
  await page.click("text=Clear All");
  expect(
    await page.isVisible('"Are you sure you want to clear data"')
  ).toBeFalsy();
  const titleValue = await page.$eval("[placeholder='Title']", el => el.value);
  expect(titleValue).toBeFalsy();
});
