const { test, expect } = require("@playwright/test");

test.describe("Bug Fix", () => {
  test("Clone endpoint modifies both endpoints", async ({ page }) => {
    await page.goto("http://localhost:8080/");
    await page.click("#menuButton");

    await page.click("text=Import");
    const exampleConfig = require("../src/utils/exampleConfig.json");
    await page.fill("textarea", JSON.stringify(exampleConfig));
    await page.click(
      "#app > div.v-dialog__content.v-dialog__content--active > div > div > div.v-card__actions > button"
    );
    await page.click("#menuButton");
    await page.click("text=Clone");
    await page.click("text=quotes");
    await page.click("text=Param Name", { force: true });
    await page.keyboard.type("test");
    await page.keyboard.press("Enter");
    await page.dblclick("#path");
    await page.keyboard.type("EndpointName");
    await page.click("text=save");
    await page.click("text=quotes");
    expect(await page.isVisible("text=test")).toBeFalsy();
    //   await page.click(
  });
});
