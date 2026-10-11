import type { Page } from "playwright";

// The value of a function the witness page exposes on its window, called with no arguments
export const readPageFunction = <T>(page: Page, name: string): Promise<T> =>
  page.evaluate((functionName) => (Reflect.get(window, functionName) as () => T)(), name);
