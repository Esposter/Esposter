import type { Page } from "playwright";

export const walk = async (page: Page, durationMs: number): Promise<void> => {
  await page.evaluate(() =>
    window.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, code: "KeyW", key: "w" })),
  );
  await page.waitForTimeout(durationMs);
  await page.evaluate(() =>
    window.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true, code: "KeyW", key: "w" })),
  );
};
