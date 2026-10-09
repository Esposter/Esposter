import type { RelandAttempt } from "#src/models/coderabbit/collect/RelandAttempt";
import type { RelandAttemptInput } from "#src/models/coderabbit/collect/RelandAttemptInput";

import { SessionRole } from "#src/models/coderabbit/collect/SessionRole";
import { abortSequencing } from "#src/services/coderabbit/collect/abortSequencing";
import { checkIsLockfileOnly } from "#src/services/coderabbit/collect/checkIsLockfileOnly";
import { checkIsSequencing } from "#src/services/coderabbit/collect/checkIsSequencing";
import { RELANDED_TRAILER, SessionRoleModelMap } from "#src/services/coderabbit/collect/constants";
import { getRelandMessage } from "#src/services/coderabbit/collect/getRelandMessage";
import { getRelandPrompt } from "#src/services/coderabbit/collect/getRelandPrompt";
import { readDirtyPaths } from "#src/services/coderabbit/collect/readDirtyPaths";
import { readHeadSha } from "#src/services/coderabbit/collect/readHeadSha";
import { readUnmergedPaths } from "#src/services/coderabbit/collect/readUnmergedPaths";
import { rebuildLockfile } from "#src/services/coderabbit/collect/rebuildLockfile";
import { runSession } from "#src/services/coderabbit/collect/runSession";
import { getGitRecords } from "#src/services/shared/getGitRecords";
import { runGit } from "#src/services/shared/runGit";
import { getResult, takeOne } from "@esposter/shared";

// One held commit picked back onto the queue's head, committed and unpushed. A lockfile conflict is rebuilt, and any
// Other is the sync's resolver's, pointed at the pick (`getRelandPrompt`); what proves the resolution is the tree it
// Left — nothing unmerged, nothing in progress, nothing untracked, HEAD where the pick started — never the session's
// Word. The collector commits it under a message of its own (`getRelandMessage`) with the held commit's author and
// Date, and a `Relanded:` trailer naming the held commit beside the ones it already carries — the count its line of
// Copies has been through (`relandHeldCommits`). A commit the queue already carries whole stages nothing and commits
// Nothing, leaving HEAD on the queue's head. A failure puts the tree back there.
export const relandHeldCommit = async ({ branch, cwd, queueSha, sha }: RelandAttemptInput): Promise<RelandAttempt> => {
  const fail = (failure: string, isSessionRun: boolean): RelandAttempt => {
    abortSequencing(cwd);
    runGit(["reset", "--hard", queueSha], cwd);
    runGit(["clean", "--force", "-d"], cwd);
    return { failure, isSessionRun };
  };
  runGit(["switch", "--detach", queueSha], cwd);
  const isPicked = getResult(() => runGit(["cherry-pick", "--no-commit", sha], cwd)).match(
    () => true,
    () => false,
  );
  const conflictedPaths = isPicked ? [] : readUnmergedPaths(cwd);
  if (!isPicked && conflictedPaths.length === 0) return fail("the pick failed with nothing unmerged", false);
  const isRebuilt = checkIsLockfileOnly(conflictedPaths) && rebuildLockfile(cwd);
  const isSessionRun = conflictedPaths.length > 0 && !isRebuilt;
  if (isSessionRun) {
    const { isEnded } = await runSession({
      cwd,
      model: SessionRoleModelMap[SessionRole.Sync],
      prompt: getRelandPrompt({ branch, conflictedPaths, sha }),
    });
    if (!isEnded) return fail("the session exited non-zero", isSessionRun);
    else if (readUnmergedPaths(cwd).length > 0 || checkIsSequencing(cwd) || readHeadSha(cwd) !== queueSha)
      return fail("the session left the pick unresolved", isSessionRun);
  }
  // `--quiet` exits non-zero when something is staged
  const isStaged = getResult(() => runGit(["diff", "--cached", "--quiet"], cwd)).match(
    () => false,
    () => true,
  );
  if (isStaged) {
    // The copy keeps the held commit's author and date, which the queue push's replay matches a commit the collector
    // Carried by (`review-queue` skill)
    const [author = "", date = "", body = ""] = takeOne(
      getGitRecords(runGit(["log", "-1", "--format=%an <%ae>%x1F%aI%x1F%B%x1E", sha], cwd)),
    );
    runGit(
      [
        "commit",
        "--quiet",
        "--message",
        getRelandMessage(body),
        "--trailer",
        `${RELANDED_TRAILER}: ${sha}`,
        "--author",
        author,
        "--date",
        date,
      ],
      cwd,
    );
  }
  return readDirtyPaths(cwd).length > 0 ? fail("the pick left the tree dirty", isSessionRun) : { isSessionRun };
};
