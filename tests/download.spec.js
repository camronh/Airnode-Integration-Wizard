const { test, expect } = require("@playwright/test");

test("Import Config", async ({ page }) => {
  await page.goto("http://localhost:8080/");
  await page.setViewportSize({ width: 1536, height: 960 });
  await page.click("text=Import");
  await page.click("text=Config");
  const exampleConfig = require("../src/utils/exampleConfig.json");
  await page.fill("[placeholder='Paste Import Here...']", JSON.stringify(exampleConfig));
  await page.click(
    "#app > div.v-dialog__content.v-dialog__content--active > div > div > div.v-card__actions > button"
  );
  const titleValue = await page.$eval("#input-14", el => el.value);
  expect(titleValue).toContain("Forge");

  const RPCValue = await page.$eval("#input-23", el => el.value);
  expect(RPCValue).toContain("https://");

  await page.type("#input-43", "shbfkajnshbjfnabhs");

  await page.click("text=Export");
  await page.click("text=Download");
  await page.waitForTimeout(999999999);
});
