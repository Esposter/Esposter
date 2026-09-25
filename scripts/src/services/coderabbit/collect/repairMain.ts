import type { RepairInput } from "#src/models/coderabbit/collect/RepairInput";
import type { RepairResult } from "#src/models/coderabbit/collect/RepairResult";

import { AttemptFailedError } from "#src/models/coderabbit/collect/AttemptFailedError";
import { SessionRole } from "#src/models/coderabbit/collect/SessionRole";
import { checkIsMarked } from "#src/services/coderabbit/collect/checkIsMarked";
import {
  EXPRESS_TRAILER,
  MAIN_BRANCH,
  REPAIR_EXHAUSTED_MARKER,
  REPAIR_FAILED_MARKER,
  REPAIRS_TRAILER,
  SESSION_ATTEMPT_CAP,
  SessionRoleModelMap,
} from "#src/services/coderabbit/collect/constants";
import { getMarker } from "#src/services/coderabbit/collect/getMarker";
import { getRepairPrompt } from "#src/services/coderabbit/collect/getRepairPrompt";
import { postCommitComment } from "#src/services/coderabbit/collect/postCommitComment";
import { readCommitAttempts } from "#src/services/coderabbit/collect/readCommitAttempts";
import { readDirtyPaths } from "#src/services/coderabbit/collect/readDirtyPaths";
import { readFailedLog } from "#src/services/coderabbit/collect/readFailedLog";
import { readHeadSha } from "#src/services/coderabbit/collect/readHeadSha";
import { readRedMainCheck } from "#src/services/coderabbit/collect/readRedMainCheck";
import { readStackedRepairs } from "#src/services/coderabbit/collect/readStackedRepairs";
import { readTrailedShas } from "#src/services/coderabbit/collect/readTrailedShas";
import { repairMechanically } from "#src/services/coderabbit/collect/repairMechanically";
import { runInstall } from "#src/services/coderabbit/collect/runInstall";
import { runSession } from "#src/services/coderabbit/collect/runSession";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { runGit } from "#src/services/shared/runGit";

// A red `main` is the collector's: the release merges on the review alone, so what CI held — a lint rule a bump
// Enabled, a size snapshot a build moved, a claimed commit the express lane cut unverified — lands on `main`
// Unread and stays until something answers it. The drain's session is pointed at CI's own verdict on the head and
// Commits the repair, which the lane verifies with every check and pushes as a cut of its own. Bounded per
// Streak: the attempts noted on the head plus the repairs already stacked at it, since a repair that landed red
// Would otherwise start a fresh count on the head it made. Both halves are counted
// Against this collector's own source — the markers naming it, and the repairs whose trailer does — so a
// Repairer fixed since gets its turns at a head an older one ran the cap up on. Past the streak the head is a
// Person's: their repair arrives as a claimed commit.
export const repairMain = async ({
  collectorSha,
  cwd,
  isDryRun,
  mainSha,
  viewerLogin,
}: RepairInput): Promise<RepairResult> => {
  const check = readRedMainCheck(mainSha);
  if (!check) return {};

  const { attempts, comments, recordFailure } = readCommitAttempts({
    collectorSha,
    marker: REPAIR_FAILED_MARKER,
    sha: mainSha,
    stackedAttempts: readStackedRepairs(mainSha, collectorSha, cwd),
    viewerLogin,
  });
  if (attempts >= SESSION_ATTEMPT_CAP) {
    console.info(`${MAIN_BRANCH} is red past ${attempts} repairs — a person's`);
    const exhaustedMarker = getMarker(REPAIR_EXHAUSTED_MARKER, mainSha);
    if (!isDryRun && !comments.some((comment) => checkIsMarked(comment, viewerLogin, exhaustedMarker)))
      postCommitComment(
        mainSha,
        `${exhaustedMarker}\n\`${MAIN_BRANCH}\` is red on ${check.url} past ${attempts} repairs, so the next is a person's — a commit carrying the \`${EXPRESS_TRAILER}\` trailer, which the lane cuts as usual.`,
      );
    return {};
  }

  console.info(
    `${MAIN_BRANCH} is red on ${check.url} — repairing it (attempt ${attempts + 1} of ${SESSION_ATTEMPT_CAP})`,
  );
  if (isDryRun) {
    console.info("would repair — a dry run runs no Claude session");
    return {};
  }

  runGit(["switch", "--detach", mainSha], cwd);
  // The tree the repairer's own checks run against is this head, not the one the event checked out (`INSTALL_COMMAND`)
  const installFailure = runInstall(cwd);
  // Answered without a session where a regenerator answers it: most of what lands on `main` unread is red for a
  // Reason with one, and the session that reads such a log spends a window of the one account every session here
  // Draws on to reach a command that needs no reading (`llm-delegation` skill). A red no regenerator touches
  // Costs the one check suite it takes to find that out, and the tree it falls through with is untouched.
  // Every regenerator runs on the installed tree, so a head that does not install goes straight to the session
  const mechanicalSha =
    installFailure === undefined ? repairMechanically({ collectorSha, cwd, mainSha, runUrl: check.url }) : undefined;
  if (mechanicalSha !== undefined) {
    console.info(`${MAIN_BRANCH} repaired at ${mechanicalSha} without a session — its regenerators answered the red`);
    return { isVerified: true, targetSha: mechanicalSha };
  }

  const prompt = getRepairPrompt({
    collectorSha,
    failedLog: readFailedLog(check.databaseId),
    installFailure,
    mainSha,
    runUrl: check.url,
  });
  const { isEnded, isStarted } = await runSession({
    cwd,
    model: SessionRoleModelMap[SessionRole.Repair],
    prompt,
  });
  if (!isStarted) {
    console.info("the repairer could not start, and no attempt is counted");
    return {};
  }
  // What proves a repair is a clean exit over a clean tree that moved by the one commit the session was told to
  // Leave, carrying the trailer that names this head and this collector; the session's word proves nothing.
  // Anything else counts the attempt on the head and ends the run, as the fold does. One commit exactly, because
  // The streak reads a repair off the head as a commit: a session that left three would spend every attempt of
  // The streak on itself, and the head it made would be a person's however answerable its red still is.
  const headSha = readHeadSha(cwd);
  const repairShas = getNonEmptyLines(runGit(["rev-list", `${mainSha}..${headSha}`], cwd));
  const trailedShas = readTrailedShas(repairShas, REPAIRS_TRAILER, cwd, collectorSha);
  if (
    !isEnded ||
    readDirtyPaths(cwd).length > 0 ||
    repairShas.length !== 1 ||
    !repairShas.every((sha) => trailedShas.has(sha))
  ) {
    recordFailure(`repair this red ${MAIN_BRANCH} head`);
    throw new AttemptFailedError(
      `the repairer left ${mainSha} unrepaired (attempt ${attempts + 1} of ${SESSION_ATTEMPT_CAP})`,
    );
  }
  return { targetSha: headSha };
};
