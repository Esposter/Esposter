import { getResult } from "@/services/error/getResult";
import { noop } from "@/util/function/noop";

export const withFinalizer = <T>(fn: () => T, finalizer?: () => void): T => {
  const runFinalizer = finalizer
    ? () => {
        getResult(finalizer).match(noop, console.error);
      }
    : undefined;
  const result = getResult(() => fn());
  runFinalizer?.();
  return result.match(
    (value) => value,
    (error) => {
      throw error;
    },
  );
};
