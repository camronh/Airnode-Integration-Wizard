const { test, expect } = require("@playwright/test");

test("Add extra RPCs to chains", async ({ page }) => {
  await page.goto("http://localhost:8080/");
  await page.click("#menuButton");

  await page.click("text=Import");
  await page.click("text=Saved");
  await page.waitForSelector("text=Loading", { visible: false });
  await page.keyboard.type("CamsCovid");
  await page.waitForTimeout(1000);
  await page.keyboard.press("Enter");
  await page.waitForSelector("text=Loading", { visible: false });
  await page.waitForTimeout(1000);
  const titleValue = await page.$eval(
    "[placeholder='Title']",
    (el) => el.value
  );
  expect(titleValue).toContain("CamsCovid");
  expect(await page.isVisible("text=Rinkeby")).toBeTruthy();
  await page.click(".mdi-database-cog");
  await page.click("text=Add Provider");
  await page.type("#chainSelect", "Rink");
  await page.type("text=RPC URL", "https://testurl.com");
  await page.click("#saveNewRPC");
  // check if at least 1 of the v-text-fields contain the text testurl
  expect(
    await page.evaluate(() => {
      let found = false;
      const elements = document.querySelectorAll("input");
      elements.forEach((element) => {
        if (element.value.includes("testurl")) {
          found = true;
        }
      });
      return found;
    })
  ).toBeTruthy();
  await page.click("text=Submit");
  await page.click(".mdi-database-cog");
  await page.waitForTimeout(1000);
  expect(
    await page.evaluate(() => {
      let found = false;
      const elements = document.querySelectorAll("input");
      elements.forEach((element) => {
        if (element.value.includes("testurl")) {
          found = true;
        }
      });
      return found;
    })
  ).toBeTruthy();
});
