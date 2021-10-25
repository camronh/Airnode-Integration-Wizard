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

test("Parse server url from Endpoint path", async ({ page }) => {
  await page.goto("http://localhost:8080/");
  const serverUrl = "https://api.testsite.com/v2";
  await page.type("text=Server", serverUrl);
  // await page.keyboard.type(serverUrl);
  await page.click("text=add endpoint");
  await page.type(
    "#path",
    `${serverUrl}​/{technology}​/{blockchain}​/{network}​/icon​/token​/{address}`
  );
  await page.keyboard.press("Tab");
  const fieldValue = await page.$eval("#path", (el) => el.value);
  expect(fieldValue.includes(serverUrl)).toBeFalsy();
});
