import type { HeldCommit } from "#src/models/coderabbit/collect/HeldCommit";

import { HELD_BRANCH_PREFIX } from "#src/services/coderabbit/collect/constants";
import { getGitRecords } from "#src/services/shared/getGitRecords";
import { runGit } from "#src/services/shared/runGit";

// The held branches and the commit each carries, as the last fetch saw them, in the order their commits were authored
// — the queue's order, so a commit parked beside the one it builds on comes back after it
export const readHeldCommits = (cwd?: string): HeldCommit[] =>
  getGitRecords(
    runGit(
      [
        "for-each-ref",
        "--sort=authordate",
        "--format=%(refname:lstrip=3)%1F%(objectname)%1E",
        `refs/remotes/origin/${HELD_BRANCH_PREFIX}`,
      ],
      cwd,
    ),
  ).map(([branch = "", sha = ""]) => ({ branch, sha }));
