/* oxlint-disable no-underscore-dangle -- the names are the page's own globals, which the page sets and these read back by name */

import type { Page } from "playwright";

export const readPrograms = (page: Page): Promise<null | number> =>
  page.evaluate(() => window.__renderer?.info.memory.programs ?? null);
