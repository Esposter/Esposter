import { getPercentile } from "#src/services/shared/getPercentile";
import { MIN_HISTORY, SLOW_RUN_FACTOR } from "#src/services/timing/constants";
import { formatSeconds } from "#src/services/timing/formatSeconds";

const MEDIAN_FRACTION = 0.5;

// The stderr line for a successful run far slower than its command's own history, or nothing when there is too little
// History to say so or the run is within the factor of its median. A signal the session reads, never a failure.
export const getSlowRunWarning = (command: string, milliseconds: number, history: number[]): string | undefined => {
  if (history.length < MIN_HISTORY) return undefined;

  const median = getPercentile(history, MEDIAN_FRACTION);
  if (milliseconds <= median * SLOW_RUN_FACTOR) return undefined;

  const ratio = (milliseconds / median).toFixed(1);
  return `${command} took ${formatSeconds(milliseconds)}, ${ratio}× its usual ${formatSeconds(median)}`;
};
