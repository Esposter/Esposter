import type { Page } from "playwright";

// The value of a function the witness page exposes on its window, called with no arguments
export const readPageFunction = <T>(page: Page, name: string): Promise<T> =>
  // The window's function is untyped across the page boundary, and
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- T is the type the caller states for what it returns
  page.evaluate((functionName) => (Reflect.get(window, functionName) as () => T)(), name);
