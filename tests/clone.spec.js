const { test, expect } = require("@playwright/test");

// });

test("Clone endpoint works", async ({ page }) => {
  await page.goto("http://localhost:8080/");
  expect(page.url()).toBe("http://localhost:8080/");
  await page.click("#menuButton");
  // expect(await page.isDisabled("#cloneEndpoint")).toBe(true);
  await page.click("text=Add Endpoint");
  await page.type("#path", "/TestPath");
  await page.click("text=Save");
  // expect(await page.isDisabled("#menuButton")).toBe(false);

  await page.click("#menuButton");
  await page.click("#cloneEndpoint");
  await page.click("text=TestPath");
  await page.fill("#path", "/TestPath2");
  await page.click("text=Save");
  expect(await page.waitForSelector("text=/TestPath")).toBeTruthy();
  expect(await page.waitForSelector("text=/TestPath2")).toBeTruthy();
});
