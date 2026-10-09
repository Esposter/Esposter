import { checkIsPicked } from "#src/services/coderabbit/collect/checkIsPicked";
import { skipStops } from "#src/services/coderabbit/collect/skipStops";

// Picks the commits onto HEAD in order, rebuilding the lockfile at a stop on it alone and skipping every other stop, so
// The sequence always runs to its end. Returns the commits it skipped, which the caller parks (`parkCommits`) before
// Anything is pushed: a skip loses nothing only once its commit is on its held branch
export const pickSkippingStops = (shas: string[], cwd: string): string[] => {
  const skippedShas: string[] = [];
  if (!checkIsPicked(shas, cwd))
    skipStops(cwd, shas.length, (stoppedSha) => {
      skippedShas.push(stoppedSha);
      return true;
    });
  return skippedShas;
};
