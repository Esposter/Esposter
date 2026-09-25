import { getResult } from "#src/services/error/getResult";
import { noop } from "#src/util/function/noop";

// Mirrors withFinalizerAsync: a finalizer that fails after the callback already did is logged rather than thrown,
// So the callback's own error — the one that says what went wrong — is the one the caller receives
export const withFinalizer = <T>(callback: () => T, finalizer?: () => void): T => {
  const callbackResult = getResult(callback);
  if (finalizer)
    getResult(finalizer).match(noop, (error) => {
      callbackResult.match(
        () => {
          throw error;
        },
        () => {
          console.error(error);
        },
      );
    });
  return callbackResult.match(
    (value) => value,
    (error) => {
      throw error;
    },
  );
};
