import { getResult } from "@/services/error/getResult";
import { noop } from "@/util/function/noop";

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
