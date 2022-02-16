const { test, expect } = require("@playwright/test");

// });

test("HTTP Works", async ({ page }) => {
  await page.goto("http://localhost:8080/");
  expect(page.url()).toBe("http://localhost:8080/");
  await page.click("#menuButton");

  await page.click("text=Import");
  const exampleConfig = require("../src/utils/exampleConfig.json");
  await page.fill("textarea", JSON.stringify(exampleConfig));
  await page.click("[type='submit']");

  expect(await page.isVisible("text=Scheme")).toBeFalsy();
  await page.click("text=apiKey");
  await page.click("text=http");
  expect(await page.isVisible("text=Scheme")).toBeTruthy();
  expect(await page.isVisible("text=Name")).toBeFalsy();
  await page.click("text=Scheme");
  await page.click("text=basic");
  await page.click("#menuButton");
  const config = await new Promise(async (resolve, reject) => {
    page.on("console", async (msg) => {
      for (const arg of msg.args()) {
        const value = await arg.jsonValue();
        if (value && value.config) resolve(value.config);
      }
    });
    await page.click("text=Export");
  });
  const correctSecurityScheme = {
    type: "http",
    scheme: "basic",
  };
  // console.log(config.ois[0].apiSpecifications.components.securitySchemes);
  expect(
    config.ois[0].apiSpecifications.components.securitySchemes.BASIC
  ).toEqual(correctSecurityScheme);
});

test("Addition Auth Works", async ({ page }) => {
  let config = null;
  page.on("console", (msg) => {
    try {
      let validJson = JSON.parse(msg.text());
      config = validJson;
    } catch (error) {}
  });

  await page.goto("http://localhost:8080/");
  expect(page.url()).toBe("http://localhost:8080/");
  await page.click("#menuButton");

  await page.click("text=Import");
  const exampleConfig = require("../src/utils/exampleConfig.json");
  await page.fill("textarea", JSON.stringify(exampleConfig));
  await page.click("[type='submit']");

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
  expect(security.length).toBe(5);
  const securitySchemes = Object.keys(
    config.ois[0].apiSpecifications.components.securitySchemes
  );
  expect(securitySchemes.length).toBe(5);
});
