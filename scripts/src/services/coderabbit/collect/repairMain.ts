import type { RepairInput } from "#src/models/coderabbit/collect/RepairInput";
import type { RepairResult } from "#src/models/coderabbit/collect/RepairResult";

import { AttemptFailedError } from "#src/models/coderabbit/collect/AttemptFailedError";
import { SessionRole } from "#src/models/coderabbit/collect/SessionRole";
import { assertCycleBudget } from "#src/services/coderabbit/collect/assertCycleBudget";
import {
  EXPRESS_TRAILER,
  MAIN_BRANCH,
  QUEUE_BRANCH,
  REPAIR_ATTEMPT_TIMEOUT_MS,
  REPAIR_EXHAUSTED_MARKER,
  REPAIR_FAILED_MARKER,
  REPAIR_SIGNATURE_SPAN_MS,
  REPAIRS_TRAILER,
  SESSION_ATTEMPT_CAP,
  SessionRoleModelMap,
} from "#src/services/coderabbit/collect/constants";
import { getAttempts } from "#src/services/coderabbit/collect/getAttempts";
import { getMarker } from "#src/services/coderabbit/collect/getMarker";
import { getRepairPrompt } from "#src/services/coderabbit/collect/getRepairPrompt";
import { openCollectorIssue } from "#src/services/coderabbit/collect/openCollectorIssue";
import { postCommitComment } from "#src/services/coderabbit/collect/postCommitComment";
import { readDirtyPaths } from "#src/services/coderabbit/collect/readDirtyPaths";
import { readFailedLog } from "#src/services/coderabbit/collect/readFailedLog";
import { readFailureSignature } from "#src/services/coderabbit/collect/readFailureSignature";
import { readHeadSha } from "#src/services/coderabbit/collect/readHeadSha";
import { readRedMainCheck } from "#src/services/coderabbit/collect/readRedMainCheck";
import { readSignatureAttempts } from "#src/services/coderabbit/collect/readSignatureAttempts";
import { readTrailedShas } from "#src/services/coderabbit/collect/readTrailedShas";
import { repairMechanically } from "#src/services/coderabbit/collect/repairMechanically";
import { runInstall } from "#src/services/coderabbit/collect/runInstall";
import { runSession } from "#src/services/coderabbit/collect/runSession";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { runGit } from "#src/services/shared/runGit";

// A red `main` is the collector's: the release merges on the review alone, so what CI held — a lint rule a bump
// Enabled, a size snapshot a build moved, a claimed commit the express lane cut unverified — lands on `main`
// Unread and stays until something answers it. The drain's session is pointed at CI's own verdict on the head and
// Commits the repair, which the repair step verifies with every check and pushes as a cut of its own. Bounded per
// Failure signature (`readFailureSignature`): the same jobs of the same workflow are the same red on whichever head
// Carries them, so a window merged over a red head starts no fresh count, and every attempt at it — failed or pushed —
// Is one marker on the head it was made at, counted across the repository's newest commit comments within a span
// (`REPAIR_SIGNATURE_SPAN_MS`) and against this collector's own source. Past the cap the signature gets one issue and
// The repairer stops on it, and nothing else waits: the walk ran before it. One attempt is bounded by its deadline
// (`REPAIR_ATTEMPT_TIMEOUT_MS`), and a deadline that passes is a failed attempt like any other.
export const repairMain = async ({
  collectorSha,
  cwd,
  isDryRun,
  mainSha,
  viewerLogin,
}: RepairInput): Promise<RepairResult> => {
  const check = readRedMainCheck(mainSha, cwd);
  if (!check) return {};

  const signature = readFailureSignature(check.databaseId);
  const { attempts, recordAttempt, recordFailure } = getAttempts({
    collectorSha,
    comments: readSignatureAttempts(),
    key: signature,
    marker: REPAIR_FAILED_MARKER,
    post: (body) => {
      postCommitComment(mainSha, body);
    },
    viewerLogin,
  });
  if (attempts >= SESSION_ATTEMPT_CAP) {
    console.info(`${MAIN_BRANCH} is red on ${signature.text} past ${attempts} repairs — its issue carries it`);
    const spanHours = Temporal.Duration.from({ milliseconds: REPAIR_SIGNATURE_SPAN_MS }).total("hours");
    openCollectorIssue({
      body: [
        `\`${MAIN_BRANCH}\` is red on ${check.url}, failing ${signature.text}.`,
        "",
        `The repairer has made ${attempts} attempts at this failure signature within ${spanHours} hours, so it repairs this signature no further. Its attempts resume once the oldest of them ages out of that span, or once the collector's own source changes. Nothing waits on it: windows go on merging and opening.`,
        "",
        `To finish: commit a repair on \`${QUEUE_BRANCH}\` that turns these jobs green, carrying the \`${EXPRESS_TRAILER}\` trailer so the express lane cuts it to \`${MAIN_BRANCH}\` unread, and close this issue once \`${MAIN_BRANCH}\` is green.`,
      ].join("\n"),
      isDryRun,
      marker: getMarker(REPAIR_EXHAUSTED_MARKER, signature, [collectorSha]),
      title: `Red ${MAIN_BRANCH} past its repairs: ${signature.text}`,
      viewerLogin,
    });
    return {};
  }

  console.info(
    `${MAIN_BRANCH} is red on ${check.url} — repairing it (attempt ${attempts + 1} of ${SESSION_ATTEMPT_CAP})`,
  );
  if (isDryRun) {
    console.info("would repair — a dry run runs no Claude session");
    return {};
  }
  // The whole attempt is budgeted, its clocks end to end, since the session's own clock is one the launcher cannot read
  assertCycleBudget(REPAIR_ATTEMPT_TIMEOUT_MS);
  const deadlineMs = Date.now() + REPAIR_ATTEMPT_TIMEOUT_MS;
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
      ? repairMechanically({ collectorSha, cwd, deadlineMs, mainSha, runUrl: check.url })
      : undefined;
  if (mechanicalSha !== undefined) {
    console.info(`${MAIN_BRANCH} repaired at ${mechanicalSha} without a session — its regenerators answered the red`);
    return { deadlineMs, isVerified: true, recordAttempt, recordFailure, targetSha: mechanicalSha };
  }

  // A deadline the install and the regenerators already spent launches no session, and fails the attempt as one would
  const remainingMs = deadlineMs - Date.now();
  const { isEnded } =
    remainingMs > 0
      ? await runSession({
          cwd,
          model: SessionRoleModelMap[SessionRole.Repair],
          prompt: getRepairPrompt({
            collectorSha,
            failedLog: readFailedLog(check.databaseId),
            installFailure,
            mainSha,
            remainingMinutes: Math.floor(Temporal.Duration.from({ milliseconds: remainingMs }).total("minutes")),
            runUrl: check.url,
          }),
          signal: AbortSignal.timeout(remainingMs),
        })
      : { isEnded: false };
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
  return { deadlineMs, recordAttempt, recordFailure, targetSha: headSha };
};
