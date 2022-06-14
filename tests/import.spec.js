const { test, expect } = require("@playwright/test");

test("Import OAS / Swagger", async ({ page }) => {
  await page.goto("http://localhost:8080/");
  await page.click("#menuButton");

  await page.click("text=Import");
  const exampleOAS = require("../src/utils/exampleOAS.json");
  await page.fill("textarea", JSON.stringify(exampleOAS));
  await page.click("[type='submit']");

  const value = await page.$eval("[placeholder='Title']", (el) => el.value);
  expect(value).toContain("Finchains");
  await page.click("text=pairs");
  expect(await page.isVisible("text=Edit Endpoint")).toBeTruthy();
});

test("Import Config", async ({ page }) => {
  await page.goto("http://localhost:8080/");
  await page.click("#menuButton");

  await page.click("text=Import");
  const exampleConfig = require("../src/utils/exampleConfig.json");
  await page.fill("textarea", JSON.stringify(exampleConfig));
  await page.click("[type='submit']");

  const titleValue = await page.$eval(
    "[placeholder='Title']",
    (el) => el.value
  );
  expect(titleValue).toContain("Forge");

  expect(await page.isChecked("text=Rinkeby")).toBeTruthy();

  // expect(await page.isVisible("text=rsk-tn")).toBeTruthy();

  await page.click("#menuButton");
  await page.click("text=Export");
  expect(await page.isVisible("text=Edit your config.json")).toBeTruthy();
});

test("Import Saved Config", async ({ page }) => {
  await page.goto("http://localhost:8080/");
  await page.click("#menuButton");

  await page.click("text=Import");
  await page.click("text=Saved");
  await page.waitForSelector("text=Loading", { visible: false });
  await page.keyboard.type("CamsCSRNG");
  await page.waitForTimeout(1000);
  await page.keyboard.press("Enter");
  await page.waitForSelector("text=Loading", { visible: false });
  await page.waitForTimeout(1000);
  const titleValue = await page.$eval(
    "[placeholder='Title']",
    (el) => el.value
  );
  expect(titleValue).toContain("CamsCSRNG");
  expect(await page.isVisible("text=Goerli")).toBeTruthy();
});
