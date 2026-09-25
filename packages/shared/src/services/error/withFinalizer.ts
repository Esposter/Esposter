import { getResult } from "#src/services/error/getResult";
import { noop } from "#src/util/function/noop";

export const withFinalizer = <T>(callback: () => T, finalizer?: () => void): T => {
  const callbackResult = getResult(callback);
  const finalizerResult = finalizer ? getResult(finalizer) : undefined;
  finalizerResult?.match(noop, (error) => {
    throw error;
  });
  return callbackResult.match(
    (value) => value,
    (error) => {
      throw error;
    },
  );
};
