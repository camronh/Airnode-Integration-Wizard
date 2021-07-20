const { test, expect } = require("@playwright/test");



test("Import OAS / Swagger", async ({ page }) => {
  await page.goto("http://localhost:8080/");
  await page.click("text=Import");
  const exampleOAS = require("../src/utils/exampleOAS.json");
  await page.fill("#input-63", JSON.stringify(exampleOAS));
  await page.click(
    "#app > div.v-dialog__content.v-dialog__content--active > div > div > div.v-card__actions > button"
  );
  const value = await page.$eval("#input-14", el => el.value);
  expect(value).toContain("Finchains");
});

test("Import Config", async ({ page }) => {
  await page.goto("http://localhost:8080/");
  await page.click("text=Import");
  await page.click("text=Config");
  const exampleConfig = require("../src/utils/exampleConfig.json");
  await page.fill("#input-63", JSON.stringify(exampleConfig));
  await page.click(
    "#app > div.v-dialog__content.v-dialog__content--active > div > div > div.v-card__actions > button"
  );
  const titleValue = await page.$eval("#input-14", el => el.value);
  expect(titleValue).toContain("Forge");

  const RPCValue = await page.$eval("#input-23", el => el.value);
  expect(RPCValue).toContain("https://");

  await page.type("#input-43", "shbfkajnshbjfnabhs");

  await page.click("text=Export");
});
