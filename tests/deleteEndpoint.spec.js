const { test, expect } = require("@playwright/test");

test.skip("Bug Fix: Unable to delete endpoint after bulk edit", async ({
  page,
}) => {
  await page.goto("http://localhost:8080/");
  await page.click("#menuButton");

  await page.click("text=Import");
  const exampleOAS = require("../src/utils/obpOAS.json");
  await page.fill(
    "[placeholder='Paste Import Here...']",
    JSON.stringify(exampleOAS)
  );
  await page.click(
    "#app > div.v-dialog__content.v-dialog__content--active > div > div > div.v-card__actions > button"
  );
  const value = await page.$eval("[placeholder='Title']", el => el.value);
  expect(value).toContain("Open Bank");
  await page.click("#menuButton");
  await page.click("text=Bulk");
  await page.click("text=body - body");
  await page.click("text=Edit Param");
  await page.click("#bulkEditIn");
  await page.waitForTimeout(1000);
  await page.click("#bulkEditIn", { force: true });

  await page.click("text=Bulk Edit Param");
  await page.click(
    ".v-dialog__content > .v-dialog > .v-card > .v-card__title > .v-btn"
  );
  const chipsBefore = await page.$$(".v-chip--removable");
  await page.click(".mdi-close-circle");
  const chipsAfter = await page.$$(".v-chip--removable");
  expect(chipsAfter.length).toBeLessThan(chipsBefore.length);
});
