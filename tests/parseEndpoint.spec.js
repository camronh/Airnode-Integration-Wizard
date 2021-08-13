const { test, expect } = require("@playwright/test");

test("Parse Endpoint path params", async ({ page }) => {
  await page.goto("http://localhost:8080/");
  await page.click("text=add endpoint");
  await page.type(
    "#path",
    "​/{technology}​/{blockchain}​/{network}​/icon​/token​/{address}"
  );
  expect(await page.isVisible("text=technology - path")).toBeTruthy();
});
