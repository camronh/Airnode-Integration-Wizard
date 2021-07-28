const { test, expect } = require("@playwright/test");

// });

test("HTTP Works", async ({ page }) => {
  await page.goto("http://localhost:8080/");
  expect(page.url()).toBe("http://localhost:8080/");
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
  expect(await page.isVisible("text=Scheme")).toBeFalsy();
  await page.click("text=apiKey");
  await page.click("text=http");
  expect(await page.isVisible("text=Scheme")).toBeTruthy();
  await page.click("text=Scheme");
  await page.click("text=basic");
  await page.click("#menuButton");
  await page.click("text=Export");
  expect(await page.isVisible("text=http")).toBeTruthy();
  // expect(await page.isVisible('text=scheme')).toBeTruthy();
  // expect(await page.isVisible('text="basic"')).toBeTruthy();
});

test("Addition Auth Works", async ({ page }) => {
  let config = null;
  page.on("console", msg => {
    try {
      let validJson = JSON.parse(msg.text());
      config = validJson;
    } catch (error) {}
  });

  await page.goto("http://localhost:8080/");
  expect(page.url()).toBe("http://localhost:8080/");
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
  await page.click('"Add Auth"');
  expect(await page.isVisible("#trashAuthBtn")).toBeTruthy();
  await page.click("#trashAuthBtn");
  expect(await page.isVisible("#trashAuthBtn")).toBeFalsy();

  await page.click("#menuButton");
  await page.click('"Add Auth"');

  const [authName, extraAuthName] = await page.$$('"Name"');
  await extraAuthName.click({ force: true });
  await page.keyboard.type("Auth2");

  await page.click("#menuButton");
  await page.click("text=Export");
  const security = Object.keys(config.ois[0].apiSpecifications.security);
  expect(security.length).toBe(2);
  const securitySchemes = Object.keys(
    config.ois[0].apiSpecifications.components.securitySchemes
  );
  expect(securitySchemes.length).toBe(2);

});
