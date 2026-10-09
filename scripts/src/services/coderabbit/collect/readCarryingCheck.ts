import type { MainCheck } from "#src/models/coderabbit/collect/MainCheck";

import { checkIsAncestor } from "#src/services/coderabbit/collect/checkIsAncestor";
import { checkIsVerdict } from "#src/services/coderabbit/collect/checkIsVerdict";
import { CI_COMPLETED_STATUS } from "#src/services/coderabbit/collect/constants";
import { readCommitCheck } from "#src/services/coderabbit/collect/readCommitCheck";
import { readMainHeadIdentities } from "#src/services/coderabbit/collect/readMainHeadIdentities";
import { readSha } from "#src/services/coderabbit/collect/readSha";

// The queued verdict a red `main` head is judged on, or `undefined` while the run that gives it is still going. The
// Branch's newest verdict counts when its run read the head under any sha the head has (`readMainHeadIdentities`): it
// Can predate a commit that has since reached both the queue and `main` — an express cut lands in the pass its own
// Push fires — and pass the job that commit broke. Once the branch's tip carries the head, the run over that tip is
// The verdict, read by its commit so a stale branch filter cannot hide it (`readCommitCheck`); one that ended with no
// Verdict leaves nothing coming, and the newest stands. So does a head the tip does not carry — a bump or a repair
// `main` took directly — since no queued run reads it before a fold brings it in.
export const readCarryingCheck = (newestCheck: MainCheck, mainSha: string, cwd: string): MainCheck | undefined => {
  const identities = readMainHeadIdentities(mainSha, cwd);
  const checkIsCarried = (sha: string): boolean => identities.some((identity) => checkIsAncestor(identity, sha, cwd));
  if (checkIsCarried(newestCheck.headSha)) return newestCheck;

  const tipSha = readSha(`origin/${newestCheck.headBranch}`, cwd);
  if (tipSha === undefined || !checkIsCarried(tipSha)) return newestCheck;

  const tipCheck = readCommitCheck(newestCheck.workflowDatabaseId.toString(), tipSha);
  if (tipCheck?.status !== CI_COMPLETED_STATUS) return undefined;
  return checkIsVerdict(tipCheck) ? tipCheck : newestCheck;
};
