const { test, expect } = require("@playwright/test");

// });

test("Endpoint Name works but isnt required", async ({ page }) => {
  await page.goto("http://localhost:8080/");
  expect(page.url()).toBe("http://localhost:8080/");
  await page.click("#menuButton");

  await page.click("text=Import");
  const exampleConfig = require("../src/utils/exampleConfig.json");
  await page.fill("textarea", JSON.stringify(exampleConfig));
  await page.click("[type='submit']");
  
});