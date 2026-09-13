import type { PortInput } from "#src/models/coderabbit/collect/PortInput";
import type { PortResult } from "#src/models/coderabbit/collect/PortResult";

import { PickOutcome } from "#src/models/coderabbit/collect/PickOutcome";
import { pickCommit } from "#src/services/coderabbit/collect/pickCommit";
import { readCherryShas } from "#src/services/coderabbit/collect/readCherryShas";
import { REVIEW_FILE_CAP } from "#src/services/coderabbit/shared/constants";
import { runGit } from "#src/services/coderabbit/shared/runGit";
import { getFileCount } from "#src/services/coderabbit/window/getFileCount";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Build the window as a branch, one cherry-pick at a time, and measure after each. Fixes ride first and whole,
// Queue commits in queue order until one conflicts or overflows the cap, and the count that decides it is read
// From the tree that will be pushed rather than estimated. Cheap on purpose — every run ports, and most exit at
// Readiness — so the checks and the fold of `main` wait for `cutCandidate`, which runs only on a window worth a slot.
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

  const queueShas: string[] = [];
  let heldSha: string | undefined;
  for (const sha of readCherryShas(developSha, queueSha, cwd)) {
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
