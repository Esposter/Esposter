// Workaround to @typescript-eslint/no-misused-promises
export const getSync =
  <T extends unknown[]>(fn: (...args: T) => Promise<unknown>) =>
  (...args: T) => {
    void fn(...args);
  };
