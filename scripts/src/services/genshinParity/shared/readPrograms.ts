import type { Page } from "playwright";

export const readPrograms = (page: Page): Promise<null | number> =>
  // The names are the page's
  // oxlint-disable-next-line no-underscore-dangle -- own globals, which the page sets and these read back by name
  page.evaluate(() => window.__renderer?.info.memory.programs ?? null);
