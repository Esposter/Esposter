// Adapts an async function to a third-party sync callback slot that we cannot widen to `Promisable<void>`.
// The sole sanctioned `void` in the codebase — `no-void` is an error everywhere else, so every other
// Fire-and-forget goes through here instead of hand-rolling its own suppression.
export const getSynchronizedFunction =
  <T extends unknown[]>(fn: (...args: T) => Promise<unknown>) =>
  (...args: T) => {
    // oxlint-disable-next-line no-void
    void fn(...args);
  };
