const { test, expect } = require("@playwright/test");

test("Import Secrets", async ({ page }) => {
  await page.goto("http://localhost:8080/");
  await page.click("#menuButton");

  await page.click("text=Import");
  await page.click("text=Saved");
  await page.keyboard.type("TesterForge");
  await page.waitForTimeout(1000);
  await page.keyboard.press("Enter");
  await page.waitForSelector("text=Loading", { visible: false });
  await page.waitForTimeout(1000);
  const titleValue = await page.$eval(
    "[placeholder='Title']",
    (el) => el.value
  );
  expect(titleValue).toContain("TesterForge");

  expect(await page.isVisible("text=rinkeby1")).toBeTruthy();

  const authValue = await page.$eval("#authValue", (el) => el.value);
  expect(authValue).toContain("TEstingsAPIKEyt");
});