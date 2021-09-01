const { test, expect } = require("@playwright/test");

test("Clone endpoint works", async ({ page }) => {
  await page.goto("http://localhost:8080/");
  await page.click("text=Add Endpoint");
  await page.fill("#path", "/{pathTest}/test?param1=hello&param2=foo");
  expect(await page.isVisible("text=param1 - query")).toBeTruthy();
});
