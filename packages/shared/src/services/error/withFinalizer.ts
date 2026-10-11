import { getResult } from "#src/services/error/getResult";
import { reportFinalizerError } from "#src/services/error/reportFinalizerError";
import { noop } from "#src/util/function/noop";

export const withFinalizer = <T>(callback: () => T, finalizer?: () => void): T => {
  const callbackResult = getResult(callback);
  if (finalizer)
    getResult(finalizer).match(noop, (error) => {
      reportFinalizerError(callbackResult, error);
    });
  return callbackResult.match(
    (value) => value,
    (error) => {
      throw error;
    },
  );
};
