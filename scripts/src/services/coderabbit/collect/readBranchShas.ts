import type { BranchShas } from "#src/models/coderabbit/collect/BranchShas";

import {
  DEVELOP_BRANCH,
  MAIN_BRANCH,
  QUEUE_BRANCH,
  REVIEW_FIXES_BRANCH,
} from "#src/services/coderabbit/collect/constants";
import { readSha } from "#src/services/coderabbit/collect/readSha";
import { runGit } from "#src/services/coderabbit/shared/runGit";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Every ref the pass measures against, read once from the remote. A missing one is named: it is the copy of the
// Cycle that runs disagreeing with the remote about a name, and which name is the whole diagnosis.
export const readBranchShas = (cwd: string): BranchShas => {
  runGit(["fetch", "--prune", "origin"], cwd);
  const mainSha = readSha(`origin/${MAIN_BRANCH}`, cwd);
  const queueSha = readSha(`origin/${QUEUE_BRANCH}`, cwd);
  const developSha = readSha(`origin/${DEVELOP_BRANCH}`, cwd);
  if (!developSha || !queueSha || !mainSha) {
    const missingBranches = [
      [MAIN_BRANCH, mainSha],
      [QUEUE_BRANCH, queueSha],
      [DEVELOP_BRANCH, developSha],
    ]
      .filter(([, sha]) => !sha)
      .map(([branch]) => `origin/${branch}`);
    throw new InvalidOperationError(
      Operation.Read,
      "coderabbit",
      `missing on the remote: ${missingBranches.join(", ")}`,
    );
  }
  return { developSha, mainSha, queueSha, reviewFixesSha: readSha(`origin/${REVIEW_FIXES_BRANCH}`, cwd) };
};
