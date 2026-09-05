// Every in-flight fire-and-forget, so callers that need completion (tests, shutdown) can await
// A deterministic drain instead of polling for observable side effects
const pendingPromises = new Set<Promise<unknown>>();
// Adapts an async function to a third-party sync callback slot that cannot be widened to `Promisable<void>`.
// The sole sanctioned fire-and-forget in the codebase — `no-void` is an error everywhere else, so every
// Other fire-and-forget goes through here instead of hand-rolling its own suppression.
export const getSynchronizedFunction =
  <T extends unknown[]>(fn: (...args: T) => Promise<unknown>) =>
  (...args: T) => {
    // eslint-disable-next-line no-restricted-syntax -- deregisters this promise from the drain set on both paths without touching its outcome, which is the one thing a Result wrapper cannot do here: this function must never reject
    const promise = fn(...args).finally(() => {
      pendingPromises.delete(promise);
    });
    pendingPromises.add(promise);
  };

export const waitForSynchronizedFunctions = async (): Promise<void> => {
  await Promise.allSettled(pendingPromises);
};
