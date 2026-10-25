import type { Page } from "playwright";

export const readPrograms = (page: Page): Promise<null | number> =>
  page.evaluate(() => window.__renderer?.info.memory.programs ?? null);
