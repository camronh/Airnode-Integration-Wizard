const { test, expect } = require("@playwright/test");

test("Exports", async ({ page }) => {
  await page.goto("http://localhost:8080/");
  await page.click("#menuButton");

  await page.click("text=Import");
  await page.click("text=Saved");
  await page.keyboard.type("CamsCSRNG");
  await page.waitForTimeout(1000);
  await page.keyboard.press("Enter");
  await page.waitForSelector("text=Loading", { visible: false });
  await page.waitForTimeout(1000);
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

  expect(config.chains[0].maxConcurrency).toBeTruthy();
  expect(config.chains[0].options.txType).toBe("eip1559");

  const {
    security,
    components: { securitySchemes },
  } = config.ois[0].apiSpecifications;

  expect(security.relayChainId).toBeTruthy();
  expect(security.relaySponsor).toBeTruthy();
  expect(securitySchemes.relayChainId).toBeTruthy();
  expect(securitySchemes.relaySponsor).toBeTruthy();
  const correctSecurityScheme = {
    type: "apiKey",
    in: "query",
    name: "Auth_Token",
  };
  expect(securitySchemes.Auth_Token).toEqual(correctSecurityScheme);
});
