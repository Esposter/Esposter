import { checkIsPicked } from "#src/services/coderabbit/collect/checkIsPicked";
import { skipStops } from "#src/services/coderabbit/collect/skipStops";

// Picks the commits onto HEAD in order, rebuilding the lockfile at a stop on it alone and skipping every other stop.
// Returns the commits it skipped, which the caller parks (`parkCommits`) before anything is pushed: a skip loses
// Nothing only once its commit is on its held branch. A sequence its skips did not run to its end returns nothing,
// Left open for the caller to abort: its HEAD holds neither the commits after the stop nor a record of them
export const pickSkippingStops = (shas: string[], cwd: string): string[] | undefined => {
  const skippedShas: string[] = [];
  if (checkIsPicked(shas, cwd)) return skippedShas;
  const isPicked = skipStops(cwd, shas.length, (stoppedSha) => {
    skippedShas.push(stoppedSha);
    return true;
  });
  return isPicked ? skippedShas : undefined;
};
