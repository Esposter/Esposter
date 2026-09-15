import type { PortInput } from "#src/models/coderabbit/collect/PortInput";
import type { PortResult } from "#src/models/coderabbit/collect/PortResult";

import { PickOutcome } from "#src/models/coderabbit/collect/PickOutcome";
import { getFileCount } from "#src/services/coderabbit/collect/getFileCount";
import { pickCommit } from "#src/services/coderabbit/collect/pickCommit";
import { readCherryShas } from "#src/services/coderabbit/collect/readCherryShas";
import { readHeadSha } from "#src/services/coderabbit/collect/readHeadSha";
import { REVIEW_FILE_CAP } from "#src/services/coderabbit/shared/constants";
import { runGit } from "#src/services/coderabbit/shared/runGit";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Build the window as a branch, one cherry-pick at a time, and measure after each from the tree that will be
// Pushed. Every count is taken from the frontier, never from the develop head: a review covers everything since
// The one that last wrote a body, so a window pushed on top of an unreviewed one is read as a single range.
export const portWindow = ({ cwd, developSha, frontierSha, queueSha, reviewFixesSha }: PortInput): PortResult => {
  runGit(["switch", "--detach", developSha], cwd);

  const fixShas = reviewFixesSha ? readCherryShas(developSha, reviewFixesSha, cwd) : [];
  for (const sha of fixShas)
    if (pickCommit(sha, cwd) === PickOutcome.Conflict)
      throw new InvalidOperationError(Operation.Update, "coderabbit", `fix ${sha} conflicts with develop`);
  // Fixes ride whole or the run fails: a drain that touched more files than its findings is for a person to see
  if (fixShas.length > 0 && getFileCount(`${frontierSha}..HEAD`, cwd) > REVIEW_FILE_CAP)
    throw new InvalidOperationError(
      Operation.Update,
      "coderabbit",
      `the fixes alone overflow the cap of ${REVIEW_FILE_CAP} files from the frontier`,
    );
  // Owed against the tree the fixes built, not develop: a queue rebased onto `ai/review-fixes` carries the fix
  // Commits as ancestors, and against develop they would be re-picked onto a tree that already holds them
  const fixesHeadSha = readHeadSha(cwd);
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
