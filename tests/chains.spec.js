const { test, expect } = require("@playwright/test");

test("CRUD a Chain", async ({ page }) => {
  await page.goto("http://localhost:8080/");
  await page.click(".mdi-database-cog");
  await page.click("text=Create New Chain");
  await page.type("text=New Chain Name", "TestChain");
  await page.type("text=ChainID", "69");
  await page.type(
    "text='RPC'",
    "https://6a5b69uoc1.execute-api.us-east-1.amazonaws.com/v1/uKljGNRyudazf01mge9PF2eTuAHFaNxy8RbKx1GM"
  );
  await page.type(
    "text=Airnode RRP Address",
    "0x01AD8A993cEa95C18447171a64D84d4eab275a98"
  );
  await page.click(
    "#chainsCard > div.v-card__text > div.row.row--dense > div:nth-child(7) > button"
  );
  await page.waitForTimeout(1000);
  expect(await page.isVisible("text=TestChain")).toBeTruthy();
  await page.click("text=TestChain");
  await page.click("#deleteTestChain");
  await page.click('button:has-text("Delete")');
  await page.waitForTimeout(2000);
  expect(await page.isVisible("text=TestChain")).toBeFalsy();

  // expect(await page.isVisible('text=scheme')).toBeTruthy();
  // expect(await page.isVisible('text="basic"')).toBeTruthy();
});
