import type { Page } from "playwright";

// The families of parts the witness page draws from the game's exports, as its body names them
export const readWitnessFamilies = async (page: Page): Promise<string[]> => {
  const familyList = (await page.evaluate(() => window.document.body.dataset.witnessFamilies)) ?? "";
  return familyList.split(",").filter(Boolean);
};
