import { LOAD_STEP_MEASURE_PREFIX } from "#src/services/loading/constants";
import { getResultAsync } from "@esposter/shared";

// Measures an awaited load step from the call to the promise's settling, as the browser's measure `genshin:load:<name>`.
// The promise's result or rejection passes through unchanged, and a rejected step is measured too, flagged `isFailed` in
// Its detail. The start is a timestamp rather than a mark, since a step of one name can run more than once at a time
export const measureLoadStep = <T>(name: string, promise: Promise<T>): Promise<T> => {
  const start = performance.now();
  const measureName = `${LOAD_STEP_MEASURE_PREFIX}${name}`;
  return getResultAsync(() => promise).match(
    (value) => {
      performance.measure(measureName, { start });
      return value;
    },
    (error) => {
      performance.measure(measureName, { detail: { isFailed: true }, start });
      throw error;
    },
  );
};
