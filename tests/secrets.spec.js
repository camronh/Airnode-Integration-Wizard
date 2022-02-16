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

  expect(await page.isVisible("text=Rinkeby")).toBeTruthy();

  const authValue = await page.$eval("#authValue", (el) => el.value);
  expect(authValue).toContain("TEstingsAPIKEyt");
});

test("Secrets Menu", async ({ page }) => {
  await page.goto("http://localhost:8080/");
  await page.click("#menuButton");

  await page.click("text=Import");
  await page.click("text=Saved");
  await page.keyboard.type("TesterForge");
  await page.waitForTimeout(1000);
  await page.keyboard.press("Enter");
  await page.waitForSelector("text=Loading", { visible: false });
  await page.waitForTimeout(1000);
  await page.click("#menuButton");

  await page.click("text=Export");
  await page.click("text=Secrets");
  const secretsValue = await page.$eval("#secretsTextArea", (el) => el.value);

  expect(secretsValue.includes("MNEMONIC")).toBeTruthy();
  expect(secretsValue.includes("TEstingsAPIKEyt")).toBeTruthy();
});

test("Export HTTP Secret", async ({ page }) => {
  await page.goto("http://localhost:8080/");
  await page.click("#menuButton");

  await page.click("text=Import");
  await page.click("text=Saved");
  await page.keyboard.type("TesterForge");
  await page.waitForTimeout(1000);
  await page.keyboard.press("Enter");
  await page.waitForSelector("text=Loading", { visible: false });
  await page.waitForTimeout(1000);

  await page.click("text=apiKey");
  await page.click("text=http");

  await page.click("text=Scheme");
  await page.click("text=bearer");

  await page.click("#menuButton");

  await page.click("text=Export");
  await page.click("text=Secrets");

  const secretsValue = await page.$eval("#secretsTextArea", (el) => el.value);

  expect(secretsValue.includes("MNEMONIC")).toBeTruthy();
  expect(
    secretsValue.includes(`TesterForge_bearer="TEstingsAPIKEyt"`)
  ).toBeTruthy();
});
