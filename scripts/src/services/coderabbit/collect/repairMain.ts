import type { RepairInput } from "#src/models/coderabbit/collect/RepairInput";
import type { RepairResult } from "#src/models/coderabbit/collect/RepairResult";

import { AttemptFailedError } from "#src/models/coderabbit/collect/AttemptFailedError";
import { SessionRole } from "#src/models/coderabbit/collect/SessionRole";
import { assertCycleBudget } from "#src/services/coderabbit/collect/assertCycleBudget";
import {
  MAIN_BRANCH,
  REPAIR_ATTEMPT_TIMEOUT_MS,
  REPAIR_REGENERATE_TIMEOUT_MS,
  REPAIR_SESSION_TIMEOUT_MS,
  REPAIRS_TRAILER,
  SESSION_ATTEMPT_CAP,
  SessionRoleModelMap,
} from "#src/services/coderabbit/collect/constants";
import { getRepairPrompt } from "#src/services/coderabbit/collect/getRepairPrompt";
import { readDirtyPaths } from "#src/services/coderabbit/collect/readDirtyPaths";
import { readFailedLog } from "#src/services/coderabbit/collect/readFailedLog";
import { readHeadSha } from "#src/services/coderabbit/collect/readHeadSha";
import { readTrailedShas } from "#src/services/coderabbit/collect/readTrailedShas";
import { repairMechanically } from "#src/services/coderabbit/collect/repairMechanically";
import { runInstall } from "#src/services/coderabbit/collect/runInstall";
import { runSession } from "#src/services/coderabbit/collect/runSession";
import { settleRedChecks } from "#src/services/coderabbit/collect/settleRedChecks";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { runGit } from "#src/services/shared/runGit";

// A red `main` is the collector's: the release merges on the review alone, so what CI held — a lint rule a bump
// Enabled, a size snapshot a build moved, a claimed commit the express lane cut unverified — lands on `main`
// Unread and stays until something answers it. The drain's session is pointed at CI's own verdict on the head and
// Commits the repair, which the repair step verifies with every check and pushes as a cut of its own — for the first
// Red the queue does not heal and whose signature is under its cap, every red workflow judged on its own
// (`settleRedChecks`). The walk ran before it, so nothing else waits on it. Each part of an attempt runs on a clock of
// Its own — the install and the regenerators, the session, each verify — so one part running long never cuts another
// Short, and a clock that runs out is a failed attempt like any other.
export const repairMain = async (repairInput: RepairInput): Promise<RepairResult> => {
  const { collectorSha, cwd, isDryRun, mainSha } = repairInput;
  const red = settleRedChecks(repairInput);
  if (red.check === undefined) return { retriggerDelaySeconds: red.retriggerDelaySeconds };

  const {
    attempts: { attempts, recordAttempt, recordFailure },
    check,
  } = red;
  console.info(
    `${MAIN_BRANCH} is red on ${check.url} — repairing it (attempt ${attempts + 1} of ${SESSION_ATTEMPT_CAP})`,
  );
  if (isDryRun) {
    console.info("would repair — a dry run runs no Claude session");
    return {};
  }
  // The whole attempt is budgeted, its clocks end to end, since the session's own clock is one the launcher cannot read
  assertCycleBudget(REPAIR_ATTEMPT_TIMEOUT_MS);
  const regenerateDeadlineMs = Date.now() + REPAIR_REGENERATE_TIMEOUT_MS;
  runGit(["switch", "--detach", mainSha], cwd);
  // The tree the repairer's own checks run against is this head, not the one the event checked out (`INSTALL_COMMAND`)
  const installFailure = runInstall(cwd);
  // Answered without a session where a regenerator answers it: most of what lands on `main` unread is red for a
  // Reason with one, and the session that reads such a log spends a window of the one account every session here
  // Draws on to reach a command that needs no reading (`llm-delegation` skill). A red no regenerator touches
  // Costs the one check suite it takes to find that out, and the tree it falls through with is untouched.
  // Every regenerator runs on the installed tree, so a head that does not install goes straight to the session
  const mechanicalSha =
    installFailure === undefined
      ? repairMechanically({ collectorSha, cwd, deadlineMs: regenerateDeadlineMs, mainSha, runUrl: check.url })
      : undefined;
  if (mechanicalSha !== undefined) {
    console.info(`${MAIN_BRANCH} repaired at ${mechanicalSha} without a session — its regenerators answered the red`);
    return { isVerified: true, recordAttempt, recordFailure, targetSha: mechanicalSha };
  }

  const { isEnded } = await runSession({
    cwd,
    model: SessionRoleModelMap[SessionRole.Repair],
    prompt: getRepairPrompt({
      collectorSha,
      failedLog: readFailedLog(check.databaseId),
      installFailure,
      mainSha,
      runUrl: check.url,
    }),
    signal: AbortSignal.timeout(REPAIR_SESSION_TIMEOUT_MS),
  });
  // What proves a repair is a clean exit over a clean tree that moved by the one commit the session was told to
  // Leave, carrying the trailer that names this head and this collector; the session's word proves nothing.
  // Anything else counts the attempt against the signature and ends the run, as the fold does. One commit exactly,
  // Because the repair is pushed as one cut the verify gives one verdict on.
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
  return { recordAttempt, recordFailure, targetSha: headSha };
};
