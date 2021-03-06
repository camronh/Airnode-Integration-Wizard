const { test, expect } = require("@playwright/test");

// });

test("Session stores", async ({ page }) => {
  await page.goto("http://localhost:8080/");
  expect(page.url()).toBe("http://localhost:8080/");

  await page.click("#menuButton");
  await page.click("text=Import");
  const exampleConfig = require("../src/utils/exampleConfig.json");
  await page.fill("textarea", JSON.stringify(exampleConfig));
  await page.click("[type='submit']");

  await page.reload();
  const RPCURLs = await page.$$("text=RPC URL");
  expect(RPCURLs.length).toBe(2);
  // expect(await page.isVisible('text=scheme')).toBeTruthy();
  // expect(await page.isVisible('text="basic"')).toBeTruthy();
});
