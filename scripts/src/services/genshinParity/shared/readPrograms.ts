import type { Page } from "playwright";

export const readPrograms = (page: Page): Promise<null | number> =>
  /* oxlint-disable-next-line no-underscore-dangle -- the names are the page's own globals, which the page sets
     and these read back by name */
  page.evaluate(() => window.__renderer?.info.memory.programs ?? null);
