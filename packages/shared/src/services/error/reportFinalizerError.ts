import type { Result } from "neverthrow";

// A finalizer that fails after the callback already did is logged rather than thrown, so the callback's own error,
// the one that says what went wrong, is the one the caller receives
export const reportFinalizerError = <T, E>(callbackResult: Result<T, E>, finalizerError: unknown): void => {
  callbackResult.match(
    () => {
      throw finalizerError;
    },
    () => {
      console.error(finalizerError);
    },
  );
};
