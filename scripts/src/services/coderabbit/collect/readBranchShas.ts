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

// Every ref the pass measures against, read once from the remote it just fetched — the pass itself holds no other
// Source of truth about where a branch is.
//
// The three the cycle cannot run without are named one by one when they are missing: a ref absent from the remote
// Is the copy of the cycle that runs disagreeing with the remote about a name, and which name is the whole of the
// Diagnosis.
export const readBranchShas = (): BranchShas => {
  runGit(["fetch", "--prune", "origin"]);
  const mainSha = readSha(`origin/${MAIN_BRANCH}`);
  const queueSha = readSha(`origin/${QUEUE_BRANCH}`);
  const developSha = readSha(`origin/${DEVELOP_BRANCH}`);
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
  return { developSha, mainSha, queueSha, reviewFixesSha: readSha(`origin/${REVIEW_FIXES_BRANCH}`) };
};
