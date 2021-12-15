

const { test, expect } = require("@playwright/test");


test.skip("Bug: Disabled chains disappear", async ({ page }) => {
  await page.goto("http://localhost:8080/");
  await page.click("#menuButton");

  await page.click("text=Import");
  await page.click("text=Saved");
  await page.waitForSelector("text=Loading", { visible: false });
  await page.keyboard.type("CamsCovid");
  await page.waitForTimeout(1000);
  await page.keyboard.press("Enter");
  await page.waitForSelector("text=Loading", { visible: false });
  await page.waitForTimeout(1000);
  const titleValue = await page.$eval("[placeholder='Title']", el => el.value);
  expect(titleValue).toContain("CamsCovid");
  expect(await page.isVisible("text=Rinkeby")).toBeTruthy();
  await page.click(".mdi-database-cog");
  await page.waitForSelector("text=Ropsten", { timeout: 1000 });
  await page.waitForTimeout(5000);
  expect(await page.isVisible("text=Ropsten")).toBeTruthy();
});