import { DRAIN_ATTEMPT_CAP, REPAIRS_TRAILER } from "#src/services/coderabbit/collect/constants";
import { readTrailedShas } from "#src/services/coderabbit/collect/readTrailedShas";
import { runGit } from "#src/services/coderabbit/shared/runGit";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";

// How many repairs sit consecutively at `main`'s head: a repair that landed and left the branch red is an
// Attempt the streak counts, or a red no repair can answer would be paid for afresh on every head it makes. The
// Walk stops at the cap, since past it the count changes nothing.
export const readStackedRepairs = (mainSha: string, cwd?: string): number => {
  const shas = getNonEmptyLines(runGit(["rev-list", `--max-count=${DRAIN_ATTEMPT_CAP}`, mainSha], cwd));
  const repairShas = readTrailedShas(shas, REPAIRS_TRAILER, cwd);
  const stacked = shas.findIndex((sha) => !repairShas.has(sha));
  return stacked === -1 ? shas.length : stacked;
};
