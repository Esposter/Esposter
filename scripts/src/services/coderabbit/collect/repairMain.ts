import type { RepairInput } from "#src/models/coderabbit/collect/RepairInput";
import type { RepairResult } from "#src/models/coderabbit/collect/RepairResult";
import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";

import { checkIsMarked } from "#src/services/coderabbit/collect/checkIsMarked";
import {
  CI_FAILURE_CONCLUSION,
  DRAIN_ATTEMPT_CAP,
  INSTALL_COMMAND,
  MAIN_BRANCH,
  REPAIR_EXHAUSTED_MARKER,
  REPAIR_FAILED_MARKER,
  REPAIRS_TRAILER,
} from "#src/services/coderabbit/collect/constants";
import { getMarker } from "#src/services/coderabbit/collect/getMarker";
import { getRepairPrompt } from "#src/services/coderabbit/collect/getRepairPrompt";
import { postCommitComment } from "#src/services/coderabbit/collect/postCommitComment";
import { readDirtyPaths } from "#src/services/coderabbit/collect/readDirtyPaths";
import { readFailedLog } from "#src/services/coderabbit/collect/readFailedLog";
import { readHeadSha } from "#src/services/coderabbit/collect/readHeadSha";
import { readMainCheck } from "#src/services/coderabbit/collect/readMainCheck";
import { readStackedRepairs } from "#src/services/coderabbit/collect/readStackedRepairs";
import { readTrailedShas } from "#src/services/coderabbit/collect/readTrailedShas";
import { runDrain } from "#src/services/coderabbit/collect/runDrain";
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
// Repair that landed red would otherwise start a fresh count on the head it made.
export const repairMain = async ({ cwd, isDryRun, mainSha, viewerLogin }: RepairInput): Promise<RepairResult> => {
  const check = readMainCheck(mainSha);
  if (check?.conclusion !== CI_FAILURE_CONCLUSION) return { isRed: false };

  const failedMarker = getMarker(REPAIR_FAILED_MARKER, mainSha);
  const comments = readEntries<GitHubEntry>(`commits/${mainSha}/comments`);
  const attempts =
    comments.filter((comment) => checkIsMarked(comment, viewerLogin, failedMarker)).length +
    readStackedRepairs(mainSha, cwd);
  if (attempts >= DRAIN_ATTEMPT_CAP) {
    console.info(`${MAIN_BRANCH} is red past ${attempts} repairs — a person's`);
    const exhaustedMarker = getMarker(REPAIR_EXHAUSTED_MARKER, mainSha);
    if (!isDryRun && !comments.some((comment) => checkIsMarked(comment, viewerLogin, exhaustedMarker)))
      postCommitComment(
        mainSha,
        `${exhaustedMarker}\n\`${MAIN_BRANCH}\` is red on ${check.url} past ${attempts} repairs, so the next is a person's: the express lane holds every claimed commit until this head is green.`,
      );
    return { isRed: true };
  }

  console.info(
    `${MAIN_BRANCH} is red on ${check.url} — repairing it (attempt ${attempts + 1} of ${DRAIN_ATTEMPT_CAP})`,
  );
  if (isDryRun) {
    console.info("would repair — a dry run runs no Claude session");
    return { isRed: true };
  }

  runGit(["switch", "--detach", mainSha], cwd);
  // The tree the repairer's own checks run against is this head, not the one the event checked out (`INSTALL_COMMAND`)
  if (spawnPnpm(INSTALL_COMMAND, { cwd, stdio: "inherit" }).status !== 0)
    throw new InvalidOperationError(Operation.Update, "coderabbit", `the install for ${mainSha} failed`);
  const prompt = getRepairPrompt({ failedLog: readFailedLog(check.databaseId), mainSha, runUrl: check.url });
  const { isDrained, isStarted } = await runDrain(prompt, cwd);
  if (!isStarted) {
    console.info("the repairer could not start, and no attempt is counted");
    return { isRed: true };
  }
  // What proves a repair is a clean exit over a clean tree that moved, every commit of the move carrying the
  // Trailer that names this head; the session's word proves nothing. Anything else counts the attempt on the
  // Head and fails the run, as the fold does.
  const headSha = readHeadSha(cwd);
  const repairShas = getNonEmptyLines(runGit(["rev-list", `${mainSha}..${headSha}`], cwd));
  const trailedShas = readTrailedShas(repairShas, REPAIRS_TRAILER, cwd);
  if (
    !isDrained ||
    readDirtyPaths(cwd).length > 0 ||
    repairShas.length === 0 ||
    !repairShas.every((sha) => trailedShas.has(sha))
  ) {
    postCommitComment(
      mainSha,
      `${failedMarker}\nRepair attempt ${attempts + 1} of this red ${MAIN_BRANCH} head failed — see the collector run.`,
    );
    throw new InvalidOperationError(
      Operation.Update,
      "coderabbit",
      `the repairer left ${mainSha} unrepaired (attempt ${attempts + 1} of ${DRAIN_ATTEMPT_CAP})`,
    );
  }
  return { isRed: true, targetSha: headSha };
};
