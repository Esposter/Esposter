// A function of any arguments, which a caller may invoke as it is. The guard names no `Function` type, which accepts any
// Function-like value without saying what it is called with
export const checkIsFunction = (value: unknown): value is (...args: unknown[]) => unknown =>
  typeof value === "function";
