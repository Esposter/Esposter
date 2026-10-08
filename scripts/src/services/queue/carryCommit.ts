import { readSha } from "#src/services/coderabbit/collect/readSha";
import { pickCommit } from "#src/services/queue/pickCommit";
import { runGit } from "#src/services/shared/runGit";

// Cherry-picks one commit onto the checkout at `cwd`. A pick that stops is aborted, so the branch is left at the commit
// Before it. A `-x` line is not added: it would name a sha the remote never held.
export const carryCommit = (commit: string, cwd: string): boolean => {
  const isCarried = pickCommit(commit, cwd);
  if (!isCarried && readSha("CHERRY_PICK_HEAD", cwd) !== undefined) runGit(["cherry-pick", "--abort"], cwd);
  return isCarried;
};
