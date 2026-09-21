import { REPAIRS_TRAILER, SESSION_ATTEMPT_CAP } from "#src/services/coderabbit/collect/constants";
import { readTrailedShas } from "#src/services/coderabbit/collect/readTrailedShas";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { runGit } from "#src/services/shared/runGit";

// How many of this collector's repairs sit consecutively at `main`'s head: a repair that landed and left the
// Branch red is an attempt the streak counts, or a red no repair can answer would be paid for afresh on every
// Head it makes. Only the repairs whose trailer names this basis count (`getRepairTrailer`), as only the markers
// Naming it do: a repairer fixed since gets its own turns at a head an older one ran the cap up on. The walk
// Stops at the cap, since past it the count changes nothing.
export const readStackedRepairs = (mainSha: string, collectorSha: string, cwd?: string): number => {
  const shas = getNonEmptyLines(runGit(["rev-list", `--max-count=${SESSION_ATTEMPT_CAP}`, mainSha], cwd));
  const repairShas = readTrailedShas(shas, REPAIRS_TRAILER, cwd, collectorSha);
  const stacked = shas.findIndex((sha) => !repairShas.has(sha));
  return stacked === -1 ? shas.length : stacked;
};
