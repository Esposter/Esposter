import type { CommitPatch } from "#src/models/coderabbit/collect/CommitPatch";

import { runGit } from "#src/services/shared/runGit";

// One commit's patch id, the identity a rewrite of the queue keeps: the replay gives the commit a new parent,
// Committer date and `-x` line, each of which changes its sha and none of which the patch id reads. `--stable` hashes
// Each file's diff apart from the order the files come in, and the diff is plumbing `diff-tree`'s, which no porcelain
// Setting reshapes
export const readCommitPatch = (sha: string, cwd?: string): CommitPatch => ({
  patchId:
    runGit(["patch-id", "--stable"], cwd, runGit(["diff-tree", "--patch", "--root", sha], cwd))
      .split(" ")
      .at(0) ?? "",
});
