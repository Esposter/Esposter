// Workaround for @typescript-eslint/no-misused-promises
export const getSynchronizedFunction =
  <T extends unknown[]>(fn: (...args: T) => Promise<unknown>) =>
  (...args: T) => {
    void fn(...args);
  };
