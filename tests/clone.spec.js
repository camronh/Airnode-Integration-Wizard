const { test, expect } = require("@playwright/test");

// });

test("Clone endpoint works", async ({ page }) => {
  await page.goto("http://localhost:8080/");
  expect(page.url()).toBe("http://localhost:8080/");

  expect(await page.isDisabled("#endpointMenuButton")).toBe(true);
  await page.click("text=Add Endpoint");
  await page.type("#path", "/TestPath");
  await page.type("#_path", "test.path");
  await page.click("text=Save");
  expect(await page.isDisabled("#endpointMenuButton")).toBe(false);

  await page.click("#endpointMenuButton");
  await page.click("#cloneEndpoint");
  await page.click("text=TestPath");
  await page.fill("#path", "/TestPath2");
  await page.click("text=Save");
  expect(await page.waitForSelector("text=/TestPath")).toBeTruthy();
  expect(await page.waitForSelector("text=/TestPath2")).toBeTruthy();
});
