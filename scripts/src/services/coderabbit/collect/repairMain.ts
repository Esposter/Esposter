import type { RepairInput } from "#src/models/coderabbit/collect/RepairInput";
import type { RepairResult } from "#src/models/coderabbit/collect/RepairResult";
import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";

import { SessionRole } from "#src/models/coderabbit/collect/SessionRole";
import { checkIsMarked } from "#src/services/coderabbit/collect/checkIsMarked";
import {
  EXPRESS_TRAILER,
  INSTALL_COMMAND,
  MAIN_BRANCH,
  REPAIR_EXHAUSTED_MARKER,
  REPAIR_FAILED_MARKER,
  REPAIRS_TRAILER,
  SESSION_ATTEMPT_CAP,
  SessionRoleModelMap,
} from "#src/services/coderabbit/collect/constants";
import { getAttemptFailure } from "#src/services/coderabbit/collect/getAttemptFailure";
import { getMarkedCount } from "#src/services/coderabbit/collect/getMarkedCount";
import { getMarker } from "#src/services/coderabbit/collect/getMarker";
import { getRepairPrompt } from "#src/services/coderabbit/collect/getRepairPrompt";
import { postCommitComment } from "#src/services/coderabbit/collect/postCommitComment";
import { readDirtyPaths } from "#src/services/coderabbit/collect/readDirtyPaths";
import { readFailedLog } from "#src/services/coderabbit/collect/readFailedLog";
import { readHeadSha } from "#src/services/coderabbit/collect/readHeadSha";
import { readRedMainCheck } from "#src/services/coderabbit/collect/readRedMainCheck";
import { readStackedRepairs } from "#src/services/coderabbit/collect/readStackedRepairs";
import { readTrailedShas } from "#src/services/coderabbit/collect/readTrailedShas";
import { runSession } from "#src/services/coderabbit/collect/runSession";
import { spawnPnpm } from "#src/services/coderabbit/collect/spawnPnpm";
import { readEntries } from "#src/services/coderabbit/shared/readEntries";
import { runGit } from "#src/services/coderabbit/shared/runGit";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A red `main` is the collector's: the release merges on the review alone, so what CI held — a lint rule a bump
// Enabled, a size snapshot a build moved — lands on `main` unread and stays until something answers it, and the
// Express lane verifies every cut on that tree, so a red `main` refuses every claimed commit for a red none of
// Them made. The drain's session is pointed at CI's own verdict on the head and commits the repair, which the
// Lane verifies with every check and pushes as a cut of its own; the claimed commits go on the run that push
// Fires. Bounded per streak: the attempts noted on the head plus the repairs already stacked at it, since a
// Repair that landed red would otherwise start a fresh count on the head it made. Past the streak the head is a
// Person's and the lane is open again: their repair arrives as a claimed commit, and holding the lane on the red
// It answers would keep it out.
export const repairMain = async ({ cwd, isDryRun, mainSha, viewerLogin }: RepairInput): Promise<RepairResult> => {
  const check = readRedMainCheck(mainSha);
  if (!check) return { isUnderRepair: false };

  const failedMarker = getMarker(REPAIR_FAILED_MARKER, mainSha);
  const comments = readEntries<GitHubEntry>(`commits/${mainSha}/comments`);
  const attempts = getMarkedCount(comments, viewerLogin, failedMarker) + readStackedRepairs(mainSha, cwd);
  if (attempts >= SESSION_ATTEMPT_CAP) {
    console.info(`${MAIN_BRANCH} is red past ${attempts} repairs — a person's`);
    const exhaustedMarker = getMarker(REPAIR_EXHAUSTED_MARKER, mainSha);
    if (!isDryRun && !comments.some((comment) => checkIsMarked(comment, viewerLogin, exhaustedMarker)))
      postCommitComment(
        mainSha,
        `${exhaustedMarker}\n\`${MAIN_BRANCH}\` is red on ${check.url} past ${attempts} repairs, so the next is a person's — a commit carrying the \`${EXPRESS_TRAILER}\` trailer, which the lane cuts as usual.`,
      );
    return { isUnderRepair: false };
  }

  console.info(
    `${MAIN_BRANCH} is red on ${check.url} — repairing it (attempt ${attempts + 1} of ${SESSION_ATTEMPT_CAP})`,
  );
  if (isDryRun) {
    console.info("would repair — a dry run runs no Claude session");
    return { isUnderRepair: true };
  }

  runGit(["switch", "--detach", mainSha], cwd);
  // The tree the repairer's own checks run against is this head, not the one the event checked out (`INSTALL_COMMAND`)
  if (spawnPnpm(INSTALL_COMMAND, { cwd, stdio: "inherit" }).status !== 0)
    throw new InvalidOperationError(Operation.Update, "coderabbit", `the install for ${mainSha} failed`);
  const prompt = getRepairPrompt({ failedLog: readFailedLog(check.databaseId), mainSha, runUrl: check.url });
  const { isEnded, isStarted } = await runSession({
    cwd,
    model: SessionRoleModelMap[SessionRole.Repair],
    prompt,
  });
  if (!isStarted) {
    console.info("the repairer could not start, and no attempt is counted");
    return { isUnderRepair: true };
  }
  // What proves a repair is a clean exit over a clean tree that moved by the one commit the session was told to
  // Leave, carrying the trailer that names this head; the session's word proves nothing. Anything else counts
  // The attempt on the head and fails the run, as the fold does. One commit exactly, because the streak reads a
  // Repair off the head as a commit: a session that left three would spend every attempt of the streak on
  // Itself, and the head it made would be a person's however answerable its red still is.
  const headSha = readHeadSha(cwd);
  const repairShas = getNonEmptyLines(runGit(["rev-list", `${mainSha}..${headSha}`], cwd));
  const trailedShas = readTrailedShas(repairShas, REPAIRS_TRAILER, cwd);
  if (
    !isEnded ||
    readDirtyPaths(cwd).length > 0 ||
    repairShas.length !== 1 ||
    !repairShas.every((sha) => trailedShas.has(sha))
  ) {
    postCommitComment(
      mainSha,
      getAttemptFailure({ attempts, marker: failedMarker, task: `repair this red ${MAIN_BRANCH} head` }),
    );
    throw new InvalidOperationError(
      Operation.Update,
      "coderabbit",
      `the repairer left ${mainSha} unrepaired (attempt ${attempts + 1} of ${SESSION_ATTEMPT_CAP})`,
    );
  }
  return { isUnderRepair: true, targetSha: headSha };
};
