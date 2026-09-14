import type { PortInput } from "#src/models/coderabbit/collect/PortInput";
import type { PortResult } from "#src/models/coderabbit/collect/PortResult";

import { PickOutcome } from "#src/models/coderabbit/collect/PickOutcome";
import { getFileCount } from "#src/services/coderabbit/collect/getFileCount";
import { pickCommit } from "#src/services/coderabbit/collect/pickCommit";
import { readCherryShas } from "#src/services/coderabbit/collect/readCherryShas";
import { REVIEW_FILE_CAP } from "#src/services/coderabbit/shared/constants";
import { runGit } from "#src/services/coderabbit/shared/runGit";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Build the window as a branch, one cherry-pick at a time, and measure after each. Fixes ride first and whole,
// Queue commits in queue order until one conflicts or overflows the cap, and the count that decides it is read
// From the tree that will be pushed rather than estimated. Cheap on purpose — every run ports, and most exit at
// Readiness — so the fold of `main` waits for `foldCandidate`, which runs only on a window worth a slot.
//
// Every count is taken from the frontier, never from the develop head. A review covers everything since the one
// That last wrote a body, so a window pushed on top of one still unreviewed is read as a single range; measuring
// From the head counts only the new commits and lets the pair overflow the cap, which is the one failure the cap
// Exists to prevent, since past it CodeRabbit skips the review outright.
export const portWindow = ({ cwd, developSha, frontierSha, queueSha, reviewFixesSha }: PortInput): PortResult => {
  runGit(["switch", "--detach", developSha], cwd);

  const fixShas = reviewFixesSha ? readCherryShas(developSha, reviewFixesSha, cwd) : [];
  for (const sha of fixShas)
    if (pickCommit(sha, cwd) === PickOutcome.Conflict)
      throw new InvalidOperationError(Operation.Update, "coderabbit", `fix ${sha} conflicts with develop`);
  // Fixes ride whole or the run fails: a drain that touched more files than its findings is for a person to see,
  // Where holding would park the window silently and `--force` would push a range the bot skips outright
  if (fixShas.length > 0 && getFileCount(`${frontierSha}..HEAD`, cwd) > REVIEW_FILE_CAP)
    throw new InvalidOperationError(
      Operation.Update,
      "coderabbit",
      `the fixes alone overflow the cap of ${REVIEW_FILE_CAP} files from the frontier`,
    );

  // What the queue owes is read against the tree the fixes just built, not against develop: a queue rebased onto
  // `ai/review-fixes` carries the fix commits as ancestors, and against develop they read as owed — re-picked onto
  // A tree that already holds them, where a later fix that rewrote their lines turns the pick from empty into a
  // Conflict that holds the whole window
  const fixesHeadSha = runGit(["rev-parse", "HEAD"], cwd).trim();
  const queueShas: string[] = [];
  let heldSha: string | undefined;
  for (const sha of readCherryShas(fixesHeadSha, queueSha, cwd)) {
    const outcome = pickCommit(sha, cwd);
    if (outcome === PickOutcome.Conflict) {
      heldSha = sha;
      break;
    } else if (outcome === PickOutcome.Empty) continue;

    if (getFileCount(`${frontierSha}..HEAD`, cwd) > REVIEW_FILE_CAP) {
      runGit(["reset", "--hard", "HEAD~1"], cwd);
      heldSha = sha;
      break;
    }
    queueShas.push(sha);
  }

  return { fileCount: getFileCount(`${frontierSha}..HEAD`, cwd), fixCount: fixShas.length, heldSha, queueShas };
};
