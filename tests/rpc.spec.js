const { test, expect } = require("@playwright/test");

// });

test("Add Extra RPC", async ({ page }) => {
  await page.goto("http://localhost:8080/");
  expect(page.url()).toBe("http://localhost:8080/");
  await page.click("#menuButton");
  await page.click("#addRPC");
  expect(await page.waitForSelector("#rpcURL2")).toBeTruthy();
  await page.click("[placeholder='Title']");
  expect(await page.isVisible("#rpcURL2")).toBeFalsy();
});
