import { getResult } from "#src/services/error/getResult";
import { noop } from "#src/util/function/noop";

export const withFinalizer = <T>(fn: () => T, finalizer?: () => void): T => {
  const result = getResult(fn);
  const finalizerResult = finalizer ? getResult(finalizer) : undefined;
  finalizerResult?.match(noop, (error) => {
    throw error;
  });
  return result.match(
    (value) => value,
    (error) => {
      throw error;
    },
  );
};
