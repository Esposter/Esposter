import { getResultAsync, noop } from "@esposter/shared";

// A failed write changes no held state, so reporting it is all that is left to do
export const settleWrite = (mutate: () => Promise<void>, onError?: (error: Error) => void): Promise<void> =>
  getResultAsync(mutate).match(noop, (error) => {
    onError?.(error);
  });
