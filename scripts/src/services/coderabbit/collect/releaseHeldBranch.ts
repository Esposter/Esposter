import type { ReleaseHeldBranchInput } from "#src/models/coderabbit/collect/ReleaseHeldBranchInput";

import { closeHeldIssue } from "#src/services/coderabbit/collect/closeHeldIssue";
import { runGit } from "#src/services/shared/runGit";
import { getResult } from "@esposter/shared";

// A held commit let go of: its branch deleted, which takes it out of the held set (`readHeldShas`), and the issue its
// Park opened closed once no branch it lists stands. A deletion that fails is logged and changes nothing else, so the
// Commit stays held with its issue open and the next run meets it again
export const releaseHeldBranch = ({ branch, cwd, heldBranches, note, viewerLogin }: ReleaseHeldBranchInput): void => {
  getResult(() => runGit(["push", "origin", "--delete", branch], cwd)).match(() => {
    heldBranches.delete(branch);
    closeHeldIssue({ branch, heldBranches, note, viewerLogin });
  }, console.error);
};
