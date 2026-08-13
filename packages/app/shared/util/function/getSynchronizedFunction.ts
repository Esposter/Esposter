// Every in-flight fire-and-forget, so callers that need completion (tests, shutdown) can await
// A deterministic drain instead of polling for observable side effects
const pendingPromises = new Set<Promise<unknown>>();
// Adapts an async function to a third-party sync callback slot that we cannot widen to `Promisable<void>`.
// The sole sanctioned fire-and-forget in the codebase — `no-void` is an error everywhere else, so every
// Other fire-and-forget goes through here instead of hand-rolling its own suppression.
export const getSynchronizedFunction =
  <T extends unknown[]>(fn: (...args: T) => Promise<unknown>) =>
  (...args: T) => {
    const promise = fn(...args).finally(() => {
      pendingPromises.delete(promise);
    });
    pendingPromises.add(promise);
  };

export const waitForSynchronizedFunctions = async (): Promise<void> => {
  await Promise.allSettled(pendingPromises);
};
