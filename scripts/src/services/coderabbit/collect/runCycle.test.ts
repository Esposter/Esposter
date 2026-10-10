import type { CheckStatus } from "#src/models/coderabbit/collect/CheckStatus";
import type { CodeScanningAlert } from "#src/models/coderabbit/collect/CodeScanningAlert";
import type { CommitCommentsPage } from "#src/models/coderabbit/collect/CommitCommentsPage";
import type { DrainStepResult } from "#src/models/coderabbit/collect/DrainStepResult";
import type { MainCheck } from "#src/models/coderabbit/collect/MainCheck";
import type { RunJobsView } from "#src/models/coderabbit/collect/RunJobsView";
import type { WindowPullRequest } from "#src/models/coderabbit/collect/WindowPullRequest";
import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";
import type { GitHubReview } from "#src/models/coderabbit/shared/GitHubReview";
import type { RepositoryView } from "#src/models/coderabbit/shared/RepositoryView";
import type { readCheckStatus as baseReadCheckStatus } from "#src/services/coderabbit/collect/readCheckStatus";
import type { runDrainStep as baseRunDrainStep } from "#src/services/coderabbit/collect/runDrainStep";
import type { runSession as baseRunSession } from "#src/services/coderabbit/collect/runSession";
import type { spawnPnpm as baseSpawnPnpm } from "#src/services/coderabbit/collect/spawnPnpm";
import type { runGh as baseRunGh } from "#src/services/shared/runGh";
import type { SpawnSyncReturns } from "node:child_process";

import { CycleOutcomeKind } from "#src/models/coderabbit/collect/CycleOutcomeKind";
import { SessionLimitedError } from "#src/models/coderabbit/collect/SessionLimitedError";
import { SessionUnstartedError } from "#src/models/coderabbit/collect/SessionUnstartedError";
import { WindowPullRequestListState } from "#src/models/coderabbit/collect/WindowPullRequestListState";
import { WindowPullRequestState } from "#src/models/coderabbit/collect/WindowPullRequestState";
import {
  ATTEMPT_RETRY_DELAY_SECONDS,
  CHECK_NAME,
  CI_COMPLETED_STATUS,
  CI_FAILURE_CONCLUSION,
  CI_SUCCESS_CONCLUSION,
  CODEQL_WORKFLOW_FILE,
  COMPLETED_DESCRIPTION,
  CYCLE_BUDGET_MS,
  DEVELOP_BRANCH,
  EXPRESS_TRAILER,
  INSTALL_COMMAND,
  INSTALL_OUTPUT_MAX_BUFFER_BYTES,
  JOB_STARTED_AT_ENVIRONMENT_VARIABLE,
  MAIN_BRANCH,
  MAIN_CHECK_WORKFLOW_FILES,
  MOVED_BRANCH_RETRY_DELAY_SECONDS,
  OPENED_WINDOW_READ_DELAY_SECONDS,
  PASS_BUCKET,
  PENDING_BUCKET,
  PENDING_CHECK_WAIT_MS,
  QUEUE_BRANCH,
  RATE_LIMITED_DESCRIPTION,
  REPAIR_ATTEMPT_TIMEOUT_MS,
  REPAIR_EXHAUSTED_MARKER,
  REPAIR_FAILED_MARKER,
  REPAIR_FIRST_MARKER,
  REPAIR_REGENERATE_COMMANDS,
  REPAIR_REGENERATE_TIMEOUT_MS,
  REPAIR_SESSION_TIMEOUT_MS,
  REPAIR_SIGNATURE_SPAN_MS,
  RERUN_MARKER,
  RETRIGGER_BUFFER_MS,
  RETRIGGER_SLEEP_CAP_MS,
  REVIEW_ASK_MARKER,
  REVIEW_ASK_WAITS_MS,
  REVIEW_FIXES_BRANCH,
  SESSION_ATTEMPT_CAP,
  SESSION_LIMITED_MARKER,
  TRANSIT_GAP_MARKER,
  WINDOW_OPENING_WINDOW_MS,
  WINDOW_RECUT_MARKER,
  WINDOW_TITLE,
} from "#src/services/coderabbit/collect/constants";
import { FIXTURE_TEST_TIMEOUT_MS, TEST_FILENAME } from "#src/services/coderabbit/collect/constants.test";
import { getFailureSignature } from "#src/services/coderabbit/collect/getFailureSignature";
import { getHeldBranch } from "#src/services/coderabbit/collect/getHeldBranch";
import { getMarker } from "#src/services/coderabbit/collect/getMarker";
import { getRepairPrompt } from "#src/services/coderabbit/collect/getRepairPrompt";
import { getRepairTrailer } from "#src/services/coderabbit/collect/getRepairTrailer";
import { getRetriggerDelaySeconds } from "#src/services/coderabbit/collect/getRetriggerDelaySeconds";
import { getWindowBranch } from "#src/services/coderabbit/collect/getWindowBranch";
import { runCycle } from "#src/services/coderabbit/collect/runCycle";
import { setupFixtureRepository } from "#src/services/coderabbit/collect/setupFixtureRepository.test";
import { PROBE_COMMENT, REVIEWS_PER_HOUR } from "#src/services/coderabbit/shared/constants";
import { runGit } from "#src/services/shared/runGit";
import { takeOne } from "@esposter/shared";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, test, vi } from "vitest";

const { readCheckStatus, runDrainStep, runGh, runSession, spawnPnpm } = vi.hoisted(() => ({
  readCheckStatus: vi.fn<typeof baseReadCheckStatus>(),
  runDrainStep: vi.fn<typeof baseRunDrainStep>(),
  runGh: vi.fn<typeof baseRunGh>(),
  runSession: vi.fn<typeof baseRunSession>(),
  spawnPnpm: vi.fn<typeof baseSpawnPnpm>(),
}));

// The seams the pass cannot reach from a fixture repository: `gh`, the check status it reads through
// `gh pr checks`, the steps that spawn Claude — the drain and the repairer's session — and
// The `pnpm` the repairer verifies a repair with. Git runs for real.
vi.mock(import("#src/services/shared/runGh"), () => ({ runGh: runGh as unknown as typeof baseRunGh }));

vi.mock(import("#src/services/coderabbit/collect/runSession"), () => ({
  runSession: runSession as unknown as typeof baseRunSession,
}));

vi.mock(import("#src/services/coderabbit/collect/spawnPnpm"), () => ({
  spawnPnpm: spawnPnpm as unknown as typeof baseSpawnPnpm,
}));

vi.mock(import("#src/services/coderabbit/collect/readCheckStatus"), () => ({
  readCheckStatus: readCheckStatus as unknown as typeof baseReadCheckStatus,
}));

vi.mock(import("#src/services/coderabbit/collect/runDrainStep"), () => ({
  runDrainStep: runDrainStep as unknown as typeof baseRunDrainStep,
}));

// The window a cut opens, as the collector titles it, over the base it stacks on
const getOpenedReason = (windowNumber: number, baseBranch = MAIN_BRANCH): string =>
  `${WINDOW_TITLE} ${windowNumber} is open over ${baseBranch} — its review reads only the commits above it`;
const getPrCalls = (subcommand: string) =>
  runGh.mock.calls.filter(([args]) => args[0] === "pr" && args[1] === subcommand);
const getCommitCommentPosts = (sha: string) =>
  runGh.mock.calls.filter(([args]) => args[1] === `repos/{owner}/{repo}/commits/${sha}/comments` && args[2] === "-f");

describe(runCycle, { timeout: FIXTURE_TEST_TIMEOUT_MS }, () => {
  const { commitFile, commitFiles, deleteFile, getCwd, installPreReceiveHook, publish, readSha, switchTo } =
    setupFixtureRepository();
  const pullRequest = 0;
  const viewerLogin = "viewerLogin";
  const completedCheck: CheckStatus = { bucket: PASS_BUCKET, description: COMPLETED_DESCRIPTION, name: CHECK_NAME };
  // A window is the pull request whose head is its own window branch and whose base is `main`
  const getWindowPullRequest = (state: WindowPullRequestState, number = pullRequest): WindowPullRequest => ({
    baseRefName: MAIN_BRANCH,
    createdAt: Temporal.Instant.fromEpochMilliseconds(0).toString(),
    headRefName: getWindowBranch(number),
    headRefOid: "",
    number,
    state,
  });
  // The release from `develop` to `main` that predates the stack, which the stack holds as its bottom while it is open
  const getLegacyPullRequest = (state: WindowPullRequestState): WindowPullRequest => ({
    baseRefName: MAIN_BRANCH,
    createdAt: Temporal.Instant.fromEpochMilliseconds(0).toString(),
    headRefName: DEVELOP_BRANCH,
    headRefOid: "",
    number: pullRequest,
    state,
  });
  const openPullRequests: WindowPullRequest[] = [getWindowPullRequest(WindowPullRequestState.Open)];
  // A base's config whose stacking guard lets a window sit on top of it
  const stackingConfig = 'reviews:\n  auto_review:\n    base_branches: ["^review/"]\n';

  // CI's verdict on main's head, red when a test says so, and what every `pnpm` the lane spawns answers
  const redRun: MainCheck = {
    attempt: 1,
    conclusion: CI_FAILURE_CONCLUSION,
    createdAt: Temporal.Instant.fromEpochMilliseconds(0).toString(),
    databaseId: 0,
    headBranch: MAIN_BRANCH,
    headSha: "",
    status: CI_COMPLETED_STATUS,
    updatedAt: Temporal.Instant.fromEpochMilliseconds(0).toString(),
    url: "",
    workflowDatabaseId: 0,
  };
  // CI's workflow, the one whose runs on a commit `answerGh` answers with the checks a test gives; no other workflow
  // Has run on any commit, and no branch's runs are listed
  const [ciWorkflowFile = ""] = MAIN_CHECK_WORKFLOW_FILES;
  // What the red run failed on, and the signature its repairs are counted under
  const redRunJobs: RunJobsView = {
    jobs: [{ conclusion: CI_FAILURE_CONCLUSION, databaseId: 0, name: "" }],
    workflowName: "",
  };
  const signature = getFailureSignature(
    redRunJobs.workflowName,
    redRunJobs.jobs.map(({ name }) => name),
  );
  const greenSpawn: SpawnSyncReturns<string> = { output: [], pid: 0, signal: null, status: 0, stderr: "", stdout: "" };
  const repairedReason = `${MAIN_BRANCH} repaired — its push runs the cycle again`;
  // The bottom window's review, pending since the epoch, waited on until the pending wait ends
  const runningReason = `pull request #${pullRequest} — the review is running; asked for once it has waited until ${new Date(PENDING_CHECK_WAIT_MS).toISOString()}`;
  // What `gh` answers: the login, the window pull requests, a check whose state was set at the epoch, the reviews, the
  // Issue comments, the repository's newest commit comments, CI's runs for main's head, a red run's jobs and log, no
  // Open issue, and `[[]]` for every other paginated list — the one page of nothing a `--slurp` returns. The pull
  // Requests are kept as GitHub would hold them: a merge closes its window and a create opens one, so a run reads back
  // What it wrote. Every commit comment and the check are dated at the epoch, the instant a test reading them pins
  const collectorSha = "collectorSha";
  const baseInput = { collectorSha, isDryRun: false };
  const answerGh = (
    windowPullRequests: WindowPullRequest[] = [],
    reviews: GitHubReview[] = [],
    issueComments: GitHubEntry[] = [],
    signatureComments: GitHubEntry[] = [],
    mainChecks: MainCheck[] = [],
    legacyPullRequests: WindowPullRequest[] = [],
  ) => {
    const windowPullRequestsNow = windowPullRequests.map((windowPullRequest) => ({ ...windowPullRequest }));
    runDrainStep.mockResolvedValue({ reviewFixesSha: undefined } satisfies DrainStepResult);
    runGh.mockImplementation((args) => {
      if (args[1] === "user") return viewerLogin;
      else if (args[0] === "pr" && args[1] === "list" && args.includes("--head"))
        return JSON.stringify(legacyPullRequests);
      else if (args[0] === "pr" && args[1] === "list") {
        const isOpenOnly = args[args.indexOf("--state") + 1] === WindowPullRequestListState.Open;
        return JSON.stringify(
          isOpenOnly
            ? windowPullRequestsNow.filter(({ state }) => state === WindowPullRequestState.Open)
            : windowPullRequestsNow,
        );
      } else if (args[0] === "pr" && args[1] === "merge") {
        const merged = windowPullRequestsNow.find(({ number }) => number.toString() === args[2]);
        if (merged) merged.state = WindowPullRequestState.Merged;
        return "";
      } else if (args[0] === "pr" && args[1] === "create") {
        windowPullRequestsNow.push({
          baseRefName: args[args.indexOf("--base") + 1] ?? MAIN_BRANCH,
          createdAt: Temporal.Instant.fromEpochMilliseconds(0).toString(),
          headRefName: args[args.indexOf("--head") + 1] ?? "",
          headRefOid: "",
          number: windowPullRequestsNow.length + pullRequest + 1,
          state: WindowPullRequestState.Open,
        });
        return "";
      } else if (args[0] === "pr" && args[1] === "view") return Temporal.Instant.fromEpochMilliseconds(0).toString();
      else if (args[0] === "run" && args[1] === "list")
        return JSON.stringify(args.includes(ciWorkflowFile) ? mainChecks : []);
      else if (args[0] === "run" && args[1] === "view")
        return args.includes("--json") ? JSON.stringify(redRunJobs) : "";
      else if (args[0] === "repo" && args[1] === "view")
        return JSON.stringify({ name: "", owner: { login: "" } } satisfies RepositoryView);
      else if (args[0] === "issue" && args[1] === "list") return "[]";
      else if (args[0] === "api" && args[1] === "graphql")
        return JSON.stringify({
          data: {
            repository: {
              commitComments: {
                nodes: signatureComments.map(({ body, id, user }) => ({
                  author: user,
                  body,
                  createdAt: Temporal.Instant.fromEpochMilliseconds(0).toString(),
                  databaseId: id,
                })),
              },
            },
          },
        } satisfies CommitCommentsPage);
      else if (args[1]?.startsWith(`repos/{owner}/{repo}/pulls/${pullRequest}/reviews`))
        return JSON.stringify([reviews]);
      else if (args[1]?.startsWith(`repos/{owner}/{repo}/issues/${pullRequest}/comments`))
        return JSON.stringify([issueComments]);
      else return "[[]]";
    });
  };
  const getMarked = (marker: string): GitHubEntry => ({
    body: marker,
    id: 0,
    updated_at: "",
    user: { login: viewerLogin },
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // The stroke spends nothing, so the pass goes on against the develop it made: a push to develop fires no run,
  // And the queue the release left behind is synced onto it here rather than on the next session push
  test("fast-forwards develop onto a merged main and measures the rest of the pass against it", async () => {
    expect.hasAssertions();

    const developSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    publish(QUEUE_BRANCH, developSha);
    const mainSha = publish(MAIN_BRANCH, commitFile(TEST_FILENAME, ""));
    answerGh([]);
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });

    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Idle,
      reason: `nothing owed — ${QUEUE_BRANCH} is synced with ${DEVELOP_BRANCH}`,
      retriggerDelaySeconds: undefined,
      targetSha: undefined,
    });
    expect(readSha(`origin/${DEVELOP_BRANCH}`)).toBe(mainSha);
    expect(readSha(`origin/${QUEUE_BRANCH}`)).toBe(mainSha);
  });

  // The claim, as the reshaper or a session writes it
  const claimExpress = (): string => {
    runGit(
      ["commit", "--quiet", "--amend", "--no-edit", "--trailer", `${EXPRESS_TRAILER}: ${TEST_FILENAME}`],
      getCwd(),
    );
    return readSha("HEAD");
  };

  // What a regenerator does to the tree, in the one test that needs it: the first of them rewrites a tracked
  // File and every other `pnpm` answers as the test's own mock says
  const answerRegenerated = (getRest: (args: string[]) => SpawnSyncReturns<string>) => {
    const [regenerateCommand = []] = REPAIR_REGENERATE_COMMANDS;
    spawnPnpm.mockImplementation((args) => {
      if (args.join(" ") !== regenerateCommand.join(" ")) return getRest(args);

      writeFileSync(join(getCwd(), `${TEST_FILENAME}.regenerated`), "");
      return greenSpawn;
    });
  };

  // Most of what lands on main unread is red for a reason the repo's own regenerators answer, and they answer it
  // Without a session: one moves the tree, the checks pass on what it left, and the repair is pushed with the
  // Shared window untouched. The push is an attempt too, so a repair that leaves the same jobs red is paid for once
  test("repairs a red main with its own regenerators, spawning no session, and counts the push", async () => {
    expect.hasAssertions();

    const mainSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    publish(QUEUE_BRANCH, mainSha);
    answerGh([], [], [], [], [redRun]);
    answerRegenerated(() => greenSpawn);
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });
    const repairSha = readSha(`origin/${MAIN_BRANCH}`);

    expect(runSession).not.toHaveBeenCalled();
    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Repaired,
      reason: repairedReason,
      retriggerDelaySeconds: undefined,
      targetSha: repairSha,
    });
    expect(runGit(["rev-list", "--parents", "--max-count=1", repairSha], getCwd()).trim()).toBe(
      `${repairSha} ${mainSha}`,
    );
    expect(getCommitCommentPosts(mainSha)).toStrictEqual([
      [
        [
          "api",
          `repos/{owner}/{repo}/commits/${mainSha}/comments`,
          "-f",
          `body=${getMarker(REPAIR_FAILED_MARKER, signature, [collectorSha])}\nAttempt 1 of ${SESSION_ATTEMPT_CAP}: repaired this red ${MAIN_BRANCH} head with ${repairSha}`,
        ],
      ],
    ]);
  });

  // A release merged red over main: its reviewed head's run red, and main's own run over the merge as a test gives it
  const publishRedRelease = (mainRun: MainCheck): string => {
    const baseSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    const reviewedSha = publish(DEVELOP_BRANCH, commitFile(TEST_FILENAME, ""));
    switchTo(baseSha);
    runGit(["merge", "--quiet", "--no-ff", "--no-edit", reviewedSha], getCwd());
    const mainSha = publish(MAIN_BRANCH, readSha("HEAD"));
    publish(QUEUE_BRANCH, mainSha);
    answerGh([]);
    const answerRest = runGh.getMockImplementation();
    runGh.mockImplementation((args) => {
      if (args[0] !== "run" || args[1] !== "list") return answerRest?.(args) ?? "";
      else if (args.includes(reviewedSha)) return JSON.stringify([redRun]);
      else return JSON.stringify([mainRun]);
    });
    answerRegenerated(() => greenSpawn);
    return mainSha;
  };

  // A release merge carries its reviewed develop head's tree, so CI's verdict there is main's before main's own
  // Run concludes: the cycle the merge fires repairs it rather than the one CI's conclusion fires later
  test("repairs a merged release red on its reviewed head while main's own run is going", async () => {
    expect.hasAssertions();

    const mainSha = publishRedRelease({ ...redRun, conclusion: "", status: "in_progress" });
    await runCycle({ ...baseInput, cwd: getCwd() });

    expect(readSha(`origin/${MAIN_BRANCH}^`)).toBe(mainSha);
  });

  // A re-run of main's own failed jobs is the head's verdict asked again, which the reviewed head's red does not
  // Pre-empt: a flake the re-run turns green would otherwise be paid a repair
  test("repairs nothing while main's own run re-runs its failed jobs, though its reviewed head is red", async () => {
    expect.hasAssertions();

    const mainSha = publishRedRelease({ ...redRun, attempt: 2, conclusion: "", status: "in_progress" });
    await runCycle({ ...baseInput, cwd: getCwd() });

    expect(readSha(`origin/${MAIN_BRANCH}`)).toBe(mainSha);
  });

  // The return stroke fast-forwards develop onto main's head, so develop's run over that commit is the newest there:
  // Main's verdict is read on main itself, or main's own red reads as develop's green
  test("repairs main's own red when develop's run over the same head is newer", async () => {
    expect.hasAssertions();

    const mainSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    publish(QUEUE_BRANCH, mainSha);
    answerGh([], [], [], [], [{ ...redRun, conclusion: CI_SUCCESS_CONCLUSION, headBranch: DEVELOP_BRANCH }, redRun]);
    answerRegenerated(() => greenSpawn);
    await runCycle({ ...baseInput, cwd: getCwd() });

    expect(readSha(`origin/${MAIN_BRANCH}^`)).toBe(mainSha);
  });

  // The invariant the regenerating repair rests on: a regeneration that did not answer the red hands the session
  // Exactly the tree it would have found, or the cheap path has made the expensive one harder
  test("restores the head when its regenerators move the tree without making it green", async () => {
    expect.hasAssertions();

    publish(DEVELOP_BRANCH, MAIN_BRANCH);
    publish(QUEUE_BRANCH, readSha(`origin/${MAIN_BRANCH}`));
    answerGh([], [], [], [], [redRun]);
    answerRegenerated((args) =>
      args.join(" ") === INSTALL_COMMAND.join(" ") ? greenSpawn : { ...greenSpawn, status: 1 },
    );
    let dirtyAtSession = "unread";
    runSession.mockImplementation(() => {
      dirtyAtSession = runGit(["status", "--porcelain", "-uall"], getCwd());
      return Promise.reject(new SessionUnstartedError());
    });

    await expect(runCycle({ ...baseInput, cwd: getCwd() })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[SessionUnstartedError: Invalid operation: Read, name: coderabbit, no session started - the launch wrote nothing]`,
    );
    expect(dirtyAtSession).toBe("");
  });

  // A head that does not install is a red like any other: no regenerator can run on it, and the session is handed
  // The install's own tail rather than the run ending on it uncounted
  test("hands a red main that does not install to the repairer with the install's tail", async () => {
    expect.hasAssertions();

    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
    const mainSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    publish(QUEUE_BRANCH, mainSha);
    answerGh([], [], [], [], [redRun]);
    const installTail = "ERR_PNPM_LOCKFILE_CONFIG_MISMATCH";
    spawnPnpm.mockReturnValue({ ...greenSpawn, status: 1, stdout: installTail });
    let prompt = "";
    runSession.mockImplementation((input) => {
      ({ prompt } = input);
      return Promise.reject(new SessionUnstartedError());
    });

    await expect(runCycle({ ...baseInput, cwd: getCwd() })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[SessionUnstartedError: Invalid operation: Read, name: coderabbit, no session started - the launch wrote nothing]`,
    );
    expect(spawnPnpm).toHaveBeenCalledExactlyOnceWith(INSTALL_COMMAND, {
      cwd: getCwd(),
      maxBuffer: INSTALL_OUTPUT_MAX_BUFFER_BYTES,
      stdio: "pipe",
    });
    expect(prompt).toBe(
      getRepairPrompt({ collectorSha, failedLog: "", installFailure: installTail, mainSha, runUrl: redRun.url }),
    );
  });

  // A red main with nothing claimed is the repairer's: the session commits at the head, the cut is verified and
  // Pushed, and the run ends on the push
  test("repairs a red main and ends the run on its push", async () => {
    expect.hasAssertions();

    const mainSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    publish(QUEUE_BRANCH, mainSha);
    answerGh([], [], [], [], [redRun]);
    spawnPnpm.mockReturnValue(greenSpawn);
    runSession.mockImplementation(() => {
      commitFile(`${TEST_FILENAME}.ts`, "");
      runGit(
        ["commit", "--quiet", "--amend", "--no-edit", "--trailer", getRepairTrailer(mainSha, collectorSha)],
        getCwd(),
      );
      return Promise.resolve({ isEnded: true });
    });
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });
    const repairSha = readSha(`origin/${MAIN_BRANCH}`);

    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Repaired,
      reason: repairedReason,
      retriggerDelaySeconds: undefined,
      targetSha: repairSha,
    });
    expect(runGit(["rev-list", "--parents", "--max-count=1", repairSha], getCwd()).trim()).toBe(
      `${repairSha} ${mainSha}`,
    );
  });

  // The queue's newest verdict on the workflow main is red on, over the commit a test gives — a run that took the least
  // Time a wake can be told from its buffer by
  const getQueueRun = (headSha: string): MainCheck => ({
    ...redRun,
    databaseId: 1,
    headBranch: QUEUE_BRANCH,
    headSha,
    updatedAt: Temporal.Instant.fromEpochMilliseconds(1).toString(),
  });
  // Answered over what `answerGh` set up: the run, listed without a commit for its own workflow, and the one job it
  // Ran, which shares the red job's name, at the conclusion the test gives
  const answerQueueRun = (headSha: string, conclusion: string): MainCheck => {
    const queueRun = getQueueRun(headSha);
    const answerRest = runGh.getMockImplementation();
    runGh.mockImplementation((args) => {
      if (
        args[0] === "run" &&
        args[1] === "list" &&
        !args.includes("--commit") &&
        args[args.indexOf("--workflow") + 1] === queueRun.workflowDatabaseId.toString()
      )
        return JSON.stringify([queueRun]);
      else if (args[0] === "run" && args[1] === "view" && args[2] === queueRun.databaseId.toString())
        return JSON.stringify({
          jobs: [{ conclusion, databaseId: 0, name: "" }],
          workflowName: "",
        } satisfies RunJobsView);
      else return answerRest?.(args) ?? "";
    });
    return queueRun;
  };

  // The queue's verdict over a commit carrying main's head and one more, which nothing queues any longer — a commit
  // Parked since — so no window is in flight to merge over the gap it reads
  const publishGap = (): { mainSha: string; verdictSha: string } => {
    const mainSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    publish(QUEUE_BRANCH, mainSha);
    return { mainSha, verdictSha: commitFile(TEST_FILENAME, "") };
  };

  // A job main failed that the queue passes is one a window still queued heals, and no repair at main's head can pass
  // Its verify while it is red: the gap spends no session and no attempt, and is recorded on the head
  test("spends no session or attempt on a red main whose failing job the queue passes, and records the gap", async () => {
    expect.hasAssertions();

    const { mainSha, verdictSha } = publishGap();
    answerGh([], [], [], [], [redRun]);
    answerQueueRun(verdictSha, CI_SUCCESS_CONCLUSION);
    await runCycle({ ...baseInput, cwd: getCwd() });

    expect(runSession).not.toHaveBeenCalled();
    expect(spawnPnpm).not.toHaveBeenCalled();
    expect(getCommitCommentPosts(mainSha).map(([args]) => args[3]?.split("\n")[0])).toStrictEqual([
      `body=${getMarker(TRANSIT_GAP_MARKER, mainSha, [verdictSha])}`,
    ]);
  });

  // The gap recorded against the queue's newest verdict is read off the head, so a later pass neither reads the queue
  // Run's jobs again nor records the gap twice. Nothing reports the queue moving on, nor — with no window open or owed
  // — a window merging over the gap, so the run wakes itself once a queue run's span has passed again
  test("reads a transit gap already recorded on main's head against the queue's newest verdict, and wakes", async () => {
    expect.hasAssertions();

    const { mainSha, verdictSha } = publishGap();
    answerGh([], [], [], [], [redRun]);
    const queueRun = answerQueueRun(verdictSha, CI_SUCCESS_CONCLUSION);
    const answerRest = runGh.getMockImplementation();
    runGh.mockImplementation((args) =>
      args[1]?.startsWith(`repos/{owner}/{repo}/commits/${mainSha}/comments?`)
        ? JSON.stringify([[getMarked(getMarker(TRANSIT_GAP_MARKER, mainSha, [verdictSha]))]])
        : (answerRest?.(args) ?? ""),
    );
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });

    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Idle,
      reason: `nothing owed — ${QUEUE_BRANCH} is synced with ${DEVELOP_BRANCH}`,
      retriggerDelaySeconds: getRetriggerDelaySeconds(1 + RETRIGGER_BUFFER_MS),
      targetSha: undefined,
    });
    expect(runSession).not.toHaveBeenCalled();
    expect(
      runGh.mock.calls.filter(
        ([args]) => args[0] === "run" && args[1] === "view" && args[2] === queueRun.databaseId.toString(),
      ),
    ).toHaveLength(0);
    expect(getCommitCommentPosts(mainSha)).toHaveLength(0);
  });

  // A queue that passes main's failing job over main's very own tree has nothing queued to heal it: it is a flake or a
  // Red of main's own, so its failed jobs run once more and the red is held for that run, woken once its span has passed
  test("re-runs the failed jobs of a red main the queue passes over the same tree, and holds it", async () => {
    expect.hasAssertions();

    const mainSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    publish(QUEUE_BRANCH, mainSha);
    answerGh([], [], [], [], [redRun]);
    answerQueueRun(mainSha, CI_SUCCESS_CONCLUSION);
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });

    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Idle,
      reason: `nothing owed — ${QUEUE_BRANCH} is synced with ${DEVELOP_BRANCH}`,
      retriggerDelaySeconds: getRetriggerDelaySeconds(1 + RETRIGGER_BUFFER_MS),
      targetSha: undefined,
    });
    expect(runGh.mock.calls.filter(([args]) => args[0] === "run" && args[1] === "rerun")).toStrictEqual([
      [["run", "rerun", redRun.databaseId.toString(), "--failed"]],
    ]);
    expect(getCommitCommentPosts(mainSha).map(([args]) => args[3]?.split("\n")[0])).toStrictEqual([
      `body=${getMarker(RERUN_MARKER, mainSha)}`,
    ]);
    expect(runSession).not.toHaveBeenCalled();
  });

  // The re-run is asked once per head: a red it leaves is the repairer's like any other
  test("repairs a red main the queue passes over the same tree once its failed jobs have run again", async () => {
    expect.hasAssertions();

    const mainSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    publish(QUEUE_BRANCH, mainSha);
    answerGh([], [], [], [], [redRun]);
    answerQueueRun(mainSha, CI_SUCCESS_CONCLUSION);
    const answerRest = runGh.getMockImplementation();
    runGh.mockImplementation((args) =>
      args[1]?.startsWith(`repos/{owner}/{repo}/commits/${mainSha}/comments?`)
        ? JSON.stringify([[getMarked(getMarker(RERUN_MARKER, mainSha))]])
        : (answerRest?.(args) ?? ""),
    );
    answerRegenerated(() => greenSpawn);
    await runCycle({ ...baseInput, cwd: getCwd() });

    expect(runGh.mock.calls.filter(([args]) => args[0] === "run" && args[1] === "rerun")).toHaveLength(0);
    expect(readSha(`origin/${MAIN_BRANCH}^`)).toBe(mainSha);
  });

  // Only a job red on the queue too is main's own to repair: the session runs as it does with no queue verdict at all
  test("repairs a red main whose failing job the queue fails too", async () => {
    expect.hasAssertions();

    const mainSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    publish(QUEUE_BRANCH, mainSha);
    answerGh([], [], [], [], [redRun]);
    answerQueueRun(mainSha, CI_FAILURE_CONCLUSION);
    spawnPnpm.mockReturnValue(greenSpawn);
    runSession.mockImplementation(() => {
      commitFile(`${TEST_FILENAME}.ts`, "");
      runGit(
        ["commit", "--quiet", "--amend", "--no-edit", "--trailer", getRepairTrailer(mainSha, collectorSha)],
        getCwd(),
      );
      return Promise.resolve({ isEnded: true });
    });
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });

    expect(runSession).toHaveBeenCalledTimes(1);
    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Repaired,
      reason: repairedReason,
      retriggerDelaySeconds: undefined,
      targetSha: readSha(`origin/${MAIN_BRANCH}`),
    });
  });

  // The queue's newest verdict can predate a commit that has since reached both the queue and main, and pass the job
  // That commit broke: the red is held while the queue's run over it goes, and since no event reports that run
  // Concluding, the run wakes itself once a queue run's span from push to verdict has passed again
  test("holds a red main the queue's newest verdict predates, waking once a queue run's span has passed", async () => {
    expect.hasAssertions();

    const verdictSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    const mainSha = publish(MAIN_BRANCH, commitFile(TEST_FILENAME, ""));
    publish(DEVELOP_BRANCH, mainSha);
    publish(QUEUE_BRANCH, mainSha);
    answerGh([], [], [], [], [redRun]);
    answerQueueRun(verdictSha, CI_SUCCESS_CONCLUSION);
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });

    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Idle,
      reason: `nothing owed — ${QUEUE_BRANCH} is synced with ${DEVELOP_BRANCH}`,
      retriggerDelaySeconds: getRetriggerDelaySeconds(1 + RETRIGGER_BUFFER_MS),
      targetSha: undefined,
    });
    expect(runSession).not.toHaveBeenCalled();
    expect(getCommitCommentPosts(mainSha)).toHaveLength(0);
  });

  // The run over the queue's tip is read by its commit, so a branch filter that lags behind it cannot hide the verdict
  // A held red waits on
  test("judges a held red on the queue's run over its tip once that run concludes", async () => {
    expect.hasAssertions();

    const verdictSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    const mainSha = publish(MAIN_BRANCH, commitFile(TEST_FILENAME, ""));
    publish(DEVELOP_BRANCH, mainSha);
    const tipSha = publish(QUEUE_BRANCH, commitFile(`${TEST_FILENAME}.ts`, ""));
    answerGh([], [], [], [], [redRun]);
    const queueRun = answerQueueRun(verdictSha, CI_SUCCESS_CONCLUSION);
    const answerRest = runGh.getMockImplementation();
    runGh.mockImplementation((args) =>
      args[0] === "run" &&
      args[1] === "list" &&
      args[args.indexOf("--workflow") + 1] === queueRun.workflowDatabaseId.toString() &&
      args[args.indexOf("--commit") + 1] === tipSha
        ? JSON.stringify([getQueueRun(tipSha)])
        : (answerRest?.(args) ?? ""),
    );
    await runCycle({ ...baseInput, cwd: getCwd() });

    expect(getCommitCommentPosts(mainSha).map(([args]) => args[3]?.split("\n")[0])).toStrictEqual([
      `body=${getMarker(TRANSIT_GAP_MARKER, mainSha, [tipSha])}`,
    ]);
  });

  // CodeQL scans main alone, so the queue never passes its gate: every red workflow on the head is judged on its own,
  // And a CI red the queue heals does not hide it
  test("repairs a CodeQL red beside a CI red the queue heals", async () => {
    expect.hasAssertions();

    const { mainSha, verdictSha } = publishGap();
    answerGh([], [], [], [], [redRun]);
    answerQueueRun(verdictSha, CI_SUCCESS_CONCLUSION);
    const answerRest = runGh.getMockImplementation();
    runGh.mockImplementation((args) =>
      args[0] === "run" && args[1] === "list" && args.includes(CODEQL_WORKFLOW_FILE)
        ? JSON.stringify([{ ...redRun, databaseId: 2, workflowDatabaseId: 1 }])
        : (answerRest?.(args) ?? ""),
    );
    answerRegenerated(() => greenSpawn);
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });

    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Repaired,
      reason: repairedReason,
      retriggerDelaySeconds: undefined,
      targetSha: readSha(`origin/${MAIN_BRANCH}`),
    });
    expect(getCommitCommentPosts(mainSha).map(([args]) => args[3]?.split("\n")[0])).toStrictEqual([
      `body=${getMarker(TRANSIT_GAP_MARKER, mainSha, [verdictSha])}`,
      `body=${getMarker(REPAIR_FAILED_MARKER, signature, [collectorSha])}`,
    ]);
  });

  // CodeQL's red alone, over a main head carrying the file its one open alert is in, and a queue one commit past it —
  // A window still owed, which the pass opens. The run took the least time a wake can be told from its buffer by
  const publishCodeQlRed = (queueSha: string): void => {
    publish(DEVELOP_BRANCH, queueSha);
    publish(QUEUE_BRANCH, queueSha);
    answerGh([]);
    const answerRest = runGh.getMockImplementation();
    runGh.mockImplementation((args) => {
      if (args[0] === "run" && args[1] === "list" && args.includes(CODEQL_WORKFLOW_FILE))
        return JSON.stringify([{ ...redRun, updatedAt: Temporal.Instant.fromEpochMilliseconds(1).toString() }]);
      else if (args[1]?.startsWith("repos/{owner}/{repo}/code-scanning/alerts?"))
        return JSON.stringify([
          [{ most_recent_instance: { location: { path: TEST_FILENAME } } } satisfies CodeScanningAlert],
        ]);
      else return answerRest?.(args) ?? "";
    });
  };

  // CodeQL scans main alone, so no queue run judges its red: an alert in a file the queue's head has already deleted is
  // A transit gap the windows heal, held with the wake its own run's span states, and no session is spent on it
  test("holds a CodeQL red whose alerts are all in files the queue changes, spending no session", async () => {
    expect.hasAssertions();

    publish(MAIN_BRANCH, commitFile(TEST_FILENAME, ""));
    const queueSha = deleteFile(TEST_FILENAME);
    publishCodeQlRed(queueSha);
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });

    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Opened,
      reason: getOpenedReason(1),
      retriggerDelaySeconds: getRetriggerDelaySeconds(1 + RETRIGGER_BUFFER_MS),
      targetSha: queueSha,
    });
    expect(runSession).not.toHaveBeenCalled();
    expect(spawnPnpm).not.toHaveBeenCalled();
  });

  // An alert in a file the queue leaves as main has it is main's own, whatever else the queue carries
  test("repairs a CodeQL red with an alert in a file the queue leaves unchanged", async () => {
    expect.hasAssertions();

    const mainSha = publish(MAIN_BRANCH, commitFile(TEST_FILENAME, ""));
    publishCodeQlRed(commitFile(`${TEST_FILENAME}.ts`, ""));
    spawnPnpm.mockReturnValue(greenSpawn);
    runSession.mockImplementation(() => {
      commitFile(`${TEST_FILENAME}.ts`, "");
      runGit(
        ["commit", "--quiet", "--amend", "--no-edit", "--trailer", getRepairTrailer(mainSha, collectorSha)],
        getCwd(),
      );
      return Promise.resolve({ isEnded: true });
    });
    await runCycle({ ...baseInput, cwd: getCwd() });

    expect(runSession).toHaveBeenCalledTimes(1);
  });

  // Each part of an attempt runs on its own clock, so an install that ran out the regenerators' clock and a session
  // That ran most of its own still leave the verify of the repair its whole suite
  test("verifies a session's repair on the suite's own clock, however long the install and the session ran", async () => {
    expect.hasAssertions();

    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
    const mainSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    publish(QUEUE_BRANCH, mainSha);
    answerGh([], [], [], [], [redRun]);
    spawnPnpm.mockImplementation((args) => {
      if (args.join(" ") === INSTALL_COMMAND.join(" ")) vi.setSystemTime(Date.now() + REPAIR_REGENERATE_TIMEOUT_MS);
      return greenSpawn;
    });
    runSession.mockImplementation(() => {
      commitFile(`${TEST_FILENAME}.ts`, "");
      runGit(
        ["commit", "--quiet", "--amend", "--no-edit", "--trailer", getRepairTrailer(mainSha, collectorSha)],
        getCwd(),
      );
      vi.setSystemTime(Date.now() + REPAIR_SESSION_TIMEOUT_MS - 1);
      return Promise.resolve({ isEnded: true });
    });
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });

    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Repaired,
      reason: repairedReason,
      retriggerDelaySeconds: undefined,
      targetSha: readSha(`origin/${MAIN_BRANCH}`),
    });
  });

  // A session's repair is verified as the cut it becomes, and one that fails there counts against its signature in the
  // Shape and under the marker the repairer's own count reads, and wakes the next attempt a minute later
  test("counts a repair that fails the checks as a cut against its signature and pushes nothing", async () => {
    expect.hasAssertions();

    const mainSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    publish(QUEUE_BRANCH, mainSha);
    answerGh([], [], [], [], [redRun]);
    spawnPnpm.mockImplementation((args) => (args[0] === "format:check" ? { ...greenSpawn, status: 1 } : greenSpawn));
    runSession.mockImplementation(() => {
      commitFile(`${TEST_FILENAME}.ts`, "");
      runGit(
        ["commit", "--quiet", "--amend", "--no-edit", "--trailer", getRepairTrailer(mainSha, collectorSha)],
        getCwd(),
      );
      return Promise.resolve({ isEnded: true });
    });

    await expect(runCycle({ ...baseInput, cwd: getCwd() })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[AttemptFailedError: Invalid operation: Update, name: coderabbit, the repair of 9107053724b5b317eae7437b5b6c689aa46d050c failed the checks as a cut]`,
    );
    expect(readSha(`origin/${MAIN_BRANCH}`)).toBe(mainSha);
    expect(getCommitCommentPosts(mainSha)).toStrictEqual([
      [
        [
          "api",
          `repos/{owner}/{repo}/commits/${mainSha}/comments`,
          "-f",
          `body=${getMarker(REPAIR_FAILED_MARKER, signature, [collectorSha])}\nAttempt 1 of ${SESSION_ATTEMPT_CAP} to repair this red ${MAIN_BRANCH} head failed — the session left a repair that failed the checks as a cut. See the collector run.`,
        ],
      ],
    ]);
  });

  // The cut goes first even over a red main, and unverified: a claimed commit may be the repair, and one its own
  // Checks refuse is made green by a later commit or the repairer — a gate here held it and what builds on it forever
  test("cuts a claimed commit over a red main without running the checks or a session", async () => {
    expect.hasAssertions();

    publish(DEVELOP_BRANCH, MAIN_BRANCH);
    commitFile(TEST_FILENAME, "");
    publish(QUEUE_BRANCH, claimExpress());
    answerGh([], [], [], [], [redRun]);
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });

    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Expressed,
      reason: `1 express commits reached ${MAIN_BRANCH}`,
      targetSha: readSha(`origin/${MAIN_BRANCH}`),
    });
    expect(spawnPnpm).not.toHaveBeenCalled();
    expect(runSession).not.toHaveBeenCalled();
  });

  // A claimed commit built on the window the stack still reviews cannot apply to main: the lane leaves it for the
  // Window to carry there, and main is left where it was
  test("leaves a claimed commit whose patch does not apply to main where it is", async () => {
    expect.hasAssertions();

    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
    const mainSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    const developSha = publish(DEVELOP_BRANCH, commitFile(TEST_FILENAME, ""));
    commitFile(TEST_FILENAME, " ");
    publish(QUEUE_BRANCH, claimExpress());
    answerGh(openPullRequests);
    readCheckStatus.mockReturnValue({ bucket: PENDING_BUCKET, description: "", name: CHECK_NAME });
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });

    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Idle,
      reason: runningReason,
      retriggerDelaySeconds: getRetriggerDelaySeconds(PENDING_CHECK_WAIT_MS),
      targetSha: undefined,
    });
    expect(readSha(`origin/${MAIN_BRANCH}`)).toBe(mainSha);
    expect(readSha(`origin/${DEVELOP_BRANCH}`)).toBe(developSha);
  });

  // With no window open and none to cut, nothing in flight can move main under a claim, so the head it failed on is the
  // Last it would meet: it is parked at once rather than counted on heads that never come, and the run wakes the next
  // For the held commits it found
  test("parks a claimed commit that does not apply to main at once when nothing in flight can move main", async () => {
    expect.hasAssertions();

    const mainSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    const heldSha = commitFile(TEST_FILENAME, "");
    publish(getHeldBranch(heldSha), heldSha);
    commitFile(TEST_FILENAME, " ");
    const claimedSha = publish(QUEUE_BRANCH, claimExpress());
    answerGh([]);
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });

    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Idle,
      reason: `parked 1 claimed commits no cut onto ${MAIN_BRANCH} applies, with nothing in flight to move it`,
      retriggerDelaySeconds: ATTEMPT_RETRY_DELAY_SECONDS,
      targetSha: undefined,
    });
    expect(readSha(`origin/${getHeldBranch(claimedSha)}`)).toBe(claimedSha);
    expect(readSha(`origin/${MAIN_BRANCH}`)).toBe(mainSha);
  });

  // The session's word proves nothing: a repair that is not a trailered commit over a clean tree counts the
  // Attempt against its signature and fails the run, as the fold does
  test("counts a repair that left no trailered commit against its signature and fails the run", async () => {
    expect.hasAssertions();

    const mainSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    publish(QUEUE_BRANCH, mainSha);
    answerGh([], [], [], [], [redRun]);
    spawnPnpm.mockReturnValue(greenSpawn);
    runSession.mockImplementation(() => {
      commitFile(TEST_FILENAME, "");
      return Promise.resolve({ isEnded: true });
    });

    await expect(runCycle({ ...baseInput, cwd: getCwd() })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[AttemptFailedError: Invalid operation: Update, name: coderabbit, the repairer left 9107053724b5b317eae7437b5b6c689aa46d050c unrepaired (attempt 1 of 3)]`,
    );
    expect(readSha(`origin/${MAIN_BRANCH}`)).toBe(mainSha);
    expect(getCommitCommentPosts(mainSha)).toStrictEqual([
      [
        [
          "api",
          `repos/{owner}/{repo}/commits/${mainSha}/comments`,
          "-f",
          `body=${getMarker(REPAIR_FAILED_MARKER, signature, [collectorSha])}\nAttempt 1 of ${SESSION_ATTEMPT_CAP} to repair this red ${MAIN_BRANCH} head failed. See the collector run.`,
        ],
      ],
    ]);
  });

  // One commit exactly, because the repair is pushed as one cut the verify gives one verdict on
  test("counts a repair that left more than one commit against its signature and fails the run", async () => {
    expect.hasAssertions();

    const mainSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    publish(QUEUE_BRANCH, mainSha);
    answerGh([], [], [], [], [redRun]);
    spawnPnpm.mockReturnValue(greenSpawn);
    runSession.mockImplementation(() => {
      for (const name of [`${TEST_FILENAME}.ts`, `${TEST_FILENAME}/${TEST_FILENAME}.ts`]) {
        commitFile(name, "");
        runGit(
          ["commit", "--quiet", "--amend", "--no-edit", "--trailer", getRepairTrailer(mainSha, collectorSha)],
          getCwd(),
        );
      }
      return Promise.resolve({ isEnded: true });
    });

    await expect(runCycle({ ...baseInput, cwd: getCwd() })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[AttemptFailedError: Invalid operation: Update, name: coderabbit, the repairer left 9107053724b5b317eae7437b5b6c689aa46d050c unrepaired (attempt 1 of 3)]`,
    );
    expect(readSha(`origin/${MAIN_BRANCH}`)).toBe(mainSha);
    expect(getCommitCommentPosts(mainSha)).toHaveLength(1);
  });

  // A red main holds no window: the reviewed bottom merges and the stack moves first, and the repair, which can run as
  // Long as its deadline, comes after
  test("merges the reviewed bottom window before it repairs a red main", async () => {
    expect.hasAssertions();

    const mainSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    publish(QUEUE_BRANCH, mainSha);
    publish(getWindowBranch(pullRequest), mainSha);
    answerGh(openPullRequests, [], [], [], [redRun]);
    readCheckStatus.mockReturnValue(completedCheck);
    runSession.mockResolvedValue({ isEnded: true });
    answerRegenerated(() => greenSpawn);
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });

    expect(getPrCalls("merge")).toHaveLength(1);
    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Repaired,
      reason: repairedReason,
      retriggerDelaySeconds: undefined,
      targetSha: readSha(`origin/${MAIN_BRANCH}`),
    });
  });

  const getSignatureAttempts = (count: number): GitHubEntry[] =>
    Array.from({ length: count }, (_value, id) => ({
      ...getMarked(getMarker(REPAIR_FAILED_MARKER, signature, [collectorSha])),
      id,
    }));

  // The attempts at a red are recorded on whichever head was red, and a window merged over it makes another head with
  // The same jobs failing: they are read across every commit's comments, so main's own head carrying none starts no
  // Fresh count
  test("counts a failure signature's repairs across a window's merge", async () => {
    expect.hasAssertions();

    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
    const mainSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    publish(QUEUE_BRANCH, mainSha);
    answerGh([], [], [], getSignatureAttempts(SESSION_ATTEMPT_CAP - 1), [redRun]);
    spawnPnpm.mockReturnValue(greenSpawn);
    runSession.mockImplementation(() => {
      commitFile(TEST_FILENAME, "");
      return Promise.resolve({ isEnded: true });
    });

    await expect(runCycle({ ...baseInput, cwd: getCwd() })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[AttemptFailedError: Invalid operation: Update, name: coderabbit, the repairer left 9107053724b5b317eae7437b5b6c689aa46d050c unrepaired (attempt 3 of 3)]`,
    );
  });

  // Past its attempts a red is handed to the tracker once, and the repairer spends nothing more on it until the span or
  // The collector moves on. Nothing reports its oldest attempt ageing out of the span, so the run wakes itself then
  test("opens one issue, repairs nothing and wakes when the oldest attempt ages out once a signature is past its attempts", async () => {
    expect.hasAssertions();

    vi.useFakeTimers({ now: REPAIR_SIGNATURE_SPAN_MS - 1, toFake: ["Date"] });
    const mainSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    publish(QUEUE_BRANCH, mainSha);
    answerGh([], [], [], getSignatureAttempts(SESSION_ATTEMPT_CAP), [redRun]);
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });
    const issueCreates = runGh.mock.calls.filter(([args]) => args[0] === "issue" && args[1] === "create");
    const createArgs = issueCreates[0]?.[0] ?? [];

    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Idle,
      reason: `nothing owed — ${QUEUE_BRANCH} is synced with ${DEVELOP_BRANCH}`,
      retriggerDelaySeconds: getRetriggerDelaySeconds(1 + RETRIGGER_BUFFER_MS),
      targetSha: undefined,
    });
    expect(issueCreates).toHaveLength(1);
    expect(createArgs[createArgs.indexOf("--body") + 1]?.split("\n")[0]).toBe(
      getMarker(REPAIR_EXHAUSTED_MARKER, signature, [collectorSha]),
    );
    expect(runSession).not.toHaveBeenCalled();
    expect(getCommitCommentPosts(mainSha)).toHaveLength(0);
  });

  // A repair the run's budget cannot hold is marked on the head, keyed by its signature: under steady merging the walk
  // Spends more of every run than a repair's clocks leave, so a red asked for last would never start
  test("marks a repair the run's budget cannot hold to go first in the next run", async () => {
    expect.hasAssertions();

    vi.useFakeTimers({ now: CYCLE_BUDGET_MS - REPAIR_ATTEMPT_TIMEOUT_MS + 1, toFake: ["Date"] });
    vi.stubEnv(JOB_STARTED_AT_ENVIRONMENT_VARIABLE, "0");
    const mainSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    publish(QUEUE_BRANCH, mainSha);
    answerGh([], [], [], [], [redRun]);

    await expect(runCycle({ ...baseInput, cwd: getCwd() })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[CycleBudgetSpentError: Invalid operation: Create, name: coderabbit, the run has spent 16 of its 100 minutes, too few for a session of up to 85]`,
    );
    expect(getCommitCommentPosts(mainSha).map(([args]) => args[3]?.split("\n")[0])).toStrictEqual([
      `body=${getMarker(REPAIR_FIRST_MARKER, signature)}`,
    ]);
  });

  // The run after the mark repairs before it walks, so a window whose review completed waits on the repair's push
  test("starts with a marked repair, ahead of the walk", async () => {
    expect.hasAssertions();

    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
    const mainSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    publish(QUEUE_BRANCH, mainSha);
    publish(getWindowBranch(pullRequest), mainSha);
    answerGh(openPullRequests, [], [], [getMarked(getMarker(REPAIR_FIRST_MARKER, signature))], [redRun]);
    readCheckStatus.mockReturnValue(completedCheck);
    answerRegenerated(() => greenSpawn);
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });

    expect(getPrCalls("merge")).toHaveLength(0);
    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Repaired,
      reason: repairedReason,
      targetSha: readSha(`origin/${MAIN_BRANCH}`),
    });
  });

  // The attempt the marked run made spends the mark, so the run after it walks first again; and a signature is marked
  // Once within the span, so a repair its budget still cannot hold is not marked a second time
  test("walks first and marks nothing again once an attempt has followed a mark within the span", async () => {
    expect.hasAssertions();

    vi.useFakeTimers({ now: CYCLE_BUDGET_MS - REPAIR_ATTEMPT_TIMEOUT_MS + 1, toFake: ["Date"] });
    vi.stubEnv(JOB_STARTED_AT_ENVIRONMENT_VARIABLE, "0");
    const mainSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    publish(QUEUE_BRANCH, mainSha);
    publish(getWindowBranch(pullRequest), mainSha);
    answerGh(
      openPullRequests,
      [],
      [],
      [getMarked(getMarker(REPAIR_FIRST_MARKER, signature)), ...getSignatureAttempts(1)],
      [redRun],
    );
    readCheckStatus.mockReturnValue(completedCheck);
    runSession.mockResolvedValue({ isEnded: true });

    await expect(runCycle({ ...baseInput, cwd: getCwd() })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[CycleBudgetSpentError: Invalid operation: Create, name: coderabbit, the run has spent 16 of its 100 minutes, too few for a session of up to 85]`,
    );
    expect(getPrCalls("merge")).toHaveLength(1);
    expect(getCommitCommentPosts(mainSha)).toHaveLength(0);
  });

  // One commit is the whole of what the queue owed — the port stops only at the cap or on a conflict — so there
  // Is nothing a size floor could wait for. The queue sits on develop's head, so the window is a fast-forward to
  // The queue's own sha. One opening is under the hourly ceiling and no walk follows it, so the run wakes itself for
  // The review, which a bot posting nothing would otherwise leave unread
  test("pushes a single owed commit, opens the first window over it and wakes once its review is due", async () => {
    expect.hasAssertions();

    publish(DEVELOP_BRANCH, MAIN_BRANCH);
    const queueSha = publish(QUEUE_BRANCH, commitFile(TEST_FILENAME, ""));
    answerGh([]);
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });

    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Opened,
      reason: getOpenedReason(1),
      retriggerDelaySeconds: OPENED_WINDOW_READ_DELAY_SECONDS,
      targetSha: queueSha,
    });
    expect(readSha(`origin/${DEVELOP_BRANCH}`)).toBe(queueSha);
    expect(readSha(`origin/${getWindowBranch(1)}`)).toBe(queueSha);
    expect(getPrCalls("create")).toHaveLength(1);
  });

  // Develop already carries the next window: nothing to port, only the window's pull request owed
  test("opens the first window over a develop that already carries it", async () => {
    expect.hasAssertions();

    const developSha = publish(DEVELOP_BRANCH, commitFile(TEST_FILENAME, ""));
    publish(QUEUE_BRANCH, developSha);
    answerGh([]);
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });

    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Opened,
      reason: getOpenedReason(1),
      retriggerDelaySeconds: OPENED_WINDOW_READ_DELAY_SECONDS,
      targetSha: developSha,
    });
    expect(readSha(`origin/${DEVELOP_BRANCH}`)).toBe(developSha);
    expect(getPrCalls("create")).toHaveLength(1);
  });

  test("reports the push it would make on a dry run and moves nothing", async () => {
    expect.hasAssertions();

    const developSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    publish(QUEUE_BRANCH, commitFile(TEST_FILENAME, ""));
    answerGh([]);
    const outcome = await runCycle({ ...baseInput, cwd: getCwd(), isDryRun: true });

    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Pushed,
      reason: `would fold ${MAIN_BRANCH} in and push the window to ${DEVELOP_BRANCH}, then open it`,
      retriggerDelaySeconds: undefined,
      targetSha: undefined,
    });
    expect(readSha(`origin/${DEVELOP_BRANCH}`)).toBe(developSha);
    expect(getPrCalls("create")).toHaveLength(0);
  });

  test("opens nothing over a window pull request a person closed", async () => {
    expect.hasAssertions();

    publish(DEVELOP_BRANCH, MAIN_BRANCH);
    publish(QUEUE_BRANCH, commitFile(TEST_FILENAME, ""));
    answerGh([getWindowPullRequest(WindowPullRequestState.Closed)]);
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });

    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Idle,
      reason: `pull request #${pullRequest} was closed without merging — a person's pause, re-open it to resume`,
      retriggerDelaySeconds: undefined,
      targetSha: undefined,
    });
    expect(getPrCalls("create")).toHaveLength(0);
  });

  // A re-cut closes the windows the bot would not review and leaves on them the cap their replacement is cut to: that is
  // No person's pause, and the replacement opens in the same pass, under that cap
  test("opens the replacement of a re-cut window under the cap its marker carries", async () => {
    expect.hasAssertions();

    publish(DEVELOP_BRANCH, MAIN_BRANCH);
    const firstSha = commitFile(TEST_FILENAME, "");
    publish(QUEUE_BRANCH, commitFile(`${TEST_FILENAME}.ts`, ""));
    const recutWindow = getWindowPullRequest(WindowPullRequestState.Closed, pullRequest + 1);
    answerGh([recutWindow]);
    const answer = runGh.getMockImplementation();
    runGh.mockImplementation((args) =>
      args[1]?.startsWith(`repos/{owner}/{repo}/issues/${recutWindow.number}/comments`)
        ? JSON.stringify([[getMarked(`<!-- ${WINDOW_RECUT_MARKER} cap:1 -->`)]])
        : (answer?.(args) ?? ""),
    );
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });

    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Opened,
      reason: getOpenedReason(recutWindow.number + 1),
      retriggerDelaySeconds: OPENED_WINDOW_READ_DELAY_SECONDS,
      targetSha: firstSha,
    });
  });

  // A re-cut's smaller cap holds the queue, but a first fix alone is cut under the plan's: the opener measures the fold
  // Against the cap the port cut the window under, so over an empty stack, with no window below to merge, it opens
  test("opens a first fix alone past a re-cut's smaller cap over an empty stack", async () => {
    expect.hasAssertions();

    const developSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    publish(QUEUE_BRANCH, developSha);
    publish(REVIEW_FIXES_BRANCH, commitFiles([TEST_FILENAME, `${TEST_FILENAME}.ts`], ""));
    const recutWindow = getWindowPullRequest(WindowPullRequestState.Closed, pullRequest + 1);
    answerGh([recutWindow]);
    const answer = runGh.getMockImplementation();
    runGh.mockImplementation((args) =>
      args[1]?.startsWith(`repos/{owner}/{repo}/issues/${recutWindow.number}/comments`)
        ? JSON.stringify([[getMarked(`<!-- ${WINDOW_RECUT_MARKER} cap:1 -->`)]])
        : (answer?.(args) ?? ""),
    );
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });

    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Opened,
      reason: getOpenedReason(recutWindow.number + 1),
      retriggerDelaySeconds: OPENED_WINDOW_READ_DELAY_SECONDS,
      targetSha: readSha(`origin/${DEVELOP_BRANCH}`),
    });
  });

  // The open release is the stack's bottom: its one review completing merges it and drains its findings, and the windows
  // Open over `main` once it has merged, the stroke having followed `main` onto `develop` first
  test("merges and drains the open release from develop once its review completes, then opens the window", async () => {
    expect.hasAssertions();

    const developSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    const queueSha = publish(QUEUE_BRANCH, commitFile(TEST_FILENAME, ""));
    answerGh([], [], [], [], [], [getLegacyPullRequest(WindowPullRequestState.Open)]);
    readCheckStatus.mockReturnValue(completedCheck);
    runSession.mockResolvedValue({ isEnded: true });
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });

    expect(getPrCalls("merge")).toStrictEqual([
      [["pr", "merge", pullRequest.toString(), "--merge", "--admin", "--match-head-commit", developSha]],
    ]);
    expect(runDrainStep).toHaveBeenCalledTimes(1);
    expect(getPrCalls("edit")).toHaveLength(0);
    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Opened,
      reason: getOpenedReason(1),
      retriggerDelaySeconds: OPENED_WINDOW_READ_DELAY_SECONDS,
      targetSha: queueSha,
    });
    expect(readSha(`origin/${DEVELOP_BRANCH}`)).toBe(queueSha);
  });

  test("holds every window while the release from develop is still reviewing", async () => {
    expect.hasAssertions();

    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
    const developSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    publish(QUEUE_BRANCH, commitFile(TEST_FILENAME, ""));
    answerGh([], [], [], [], [], [getLegacyPullRequest(WindowPullRequestState.Open)]);
    readCheckStatus.mockReturnValue({ bucket: PENDING_BUCKET, description: "", name: CHECK_NAME });
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });

    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Idle,
      reason: `pull request #${pullRequest} from ${DEVELOP_BRANCH} to ${MAIN_BRANCH} is open — no window opens until its review completes and it merges`,
      retriggerDelaySeconds: getRetriggerDelaySeconds(PENDING_CHECK_WAIT_MS),
      targetSha: undefined,
    });
    expect(getPrCalls("merge")).toHaveLength(0);
    expect(runDrainStep).not.toHaveBeenCalled();
    expect(getPrCalls("create")).toHaveLength(0);
    expect(readSha(`origin/${DEVELOP_BRANCH}`)).toBe(developSha);
  });

  test("pauses on a release pull request from develop that a person closed", async () => {
    expect.hasAssertions();

    publish(DEVELOP_BRANCH, MAIN_BRANCH);
    publish(QUEUE_BRANCH, commitFile(TEST_FILENAME, ""));
    answerGh([], [], [], [], [], [getLegacyPullRequest(WindowPullRequestState.Closed)]);
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });

    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Idle,
      reason: `pull request #${pullRequest} from ${DEVELOP_BRANCH} to ${MAIN_BRANCH} was closed without merging — a person's pause`,
      retriggerDelaySeconds: undefined,
      targetSha: undefined,
    });
    expect(getPrCalls("create")).toHaveLength(0);
  });

  // The release is a person's, opened over whatever `develop` carried: one the bot keeps skipping past its last ask is
  // Closed with its branch kept, `develop` moves back to where it met `main`, and the same pass cuts its commits into a
  // Window under the cap, since no event follows the close
  test("closes a release from develop the bot skips past its last ask and opens a window of its commits", async () => {
    expect.hasAssertions();

    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
    const developSha = publish(DEVELOP_BRANCH, commitFile(TEST_FILENAME, ""));
    publish(QUEUE_BRANCH, developSha);
    const release: WindowPullRequest = { ...getLegacyPullRequest(WindowPullRequestState.Open), headRefOid: developSha };
    const ask: GitHubEntry = {
      ...getMarked(`${PROBE_COMMENT}\n<!-- ${REVIEW_ASK_MARKER} -->`),
      updated_at: new Date(0).toISOString(),
    };
    answerGh([], [], [ask, ask, ask], [], [], [release]);
    const answer = runGh.getMockImplementation();
    runGh.mockImplementation((args) => {
      if (args[0] === "pr" && args[1] === "close") release.state = WindowPullRequestState.Closed;
      return answer?.(args) ?? "";
    });
    readCheckStatus.mockReturnValue({ bucket: PASS_BUCKET, description: "", name: CHECK_NAME });
    vi.setSystemTime(takeOne(REVIEW_ASK_WAITS_MS, 2));
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });

    expect(getPrCalls("close")).toStrictEqual([[["pr", "close", release.number.toString()]]]);
    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Opened,
      reason: getOpenedReason(1),
      retriggerDelaySeconds: OPENED_WINDOW_READ_DELAY_SECONDS,
      targetSha: developSha,
    });
  });

  // A re-cut leaves its marker on the release it closed, which gave its commits back to the opener: no person's pause
  test("opens a window over a release from develop that a re-cut closed", async () => {
    expect.hasAssertions();

    publish(DEVELOP_BRANCH, MAIN_BRANCH);
    const queueSha = publish(QUEUE_BRANCH, commitFile(TEST_FILENAME, ""));
    answerGh(
      [],
      [],
      [getMarked(`<!-- ${WINDOW_RECUT_MARKER} cap:1 -->`)],
      [],
      [],
      [getLegacyPullRequest(WindowPullRequestState.Closed)],
    );
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });

    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Opened,
      reason: getOpenedReason(1),
      retriggerDelaySeconds: OPENED_WINDOW_READ_DELAY_SECONDS,
      targetSha: queueSha,
    });
  });

  // A push to `develop` fires no run, so a `develop` that moved under the close of the windows off the chain owes the
  // Run its wake, whatever the rest of the pass finds
  test("wakes the cycle when develop moves under the close of the windows off the chain", async () => {
    expect.hasAssertions();

    const mainSha = readSha(`origin/${MAIN_BRANCH}`);
    publish(DEVELOP_BRANCH, commitFile(TEST_FILENAME, ""));
    publish(QUEUE_BRANCH, mainSha);
    installPreReceiveHook(`env -u GIT_QUARANTINE_PATH git update-ref refs/heads/${DEVELOP_BRANCH} ${mainSha}`);
    answerGh([
      getWindowPullRequest(WindowPullRequestState.Open, pullRequest + 1),
      getWindowPullRequest(WindowPullRequestState.Open, pullRequest + 2),
    ]);
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });

    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Idle,
      reason: `${DEVELOP_BRANCH} moved during the run — nothing pushed, the next run re-measures; nothing owed — ${QUEUE_BRANCH} is synced with ${DEVELOP_BRANCH}`,
      retriggerDelaySeconds: MOVED_BRANCH_RETRY_DELAY_SECONDS,
      targetSha: undefined,
    });
    expect(getPrCalls("close")).toStrictEqual([]);
  });

  test("opens nothing over an open window while no stacking guard reaches it", async () => {
    expect.hasAssertions();

    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
    const developSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    publish(QUEUE_BRANCH, commitFile(TEST_FILENAME, ""));
    answerGh(openPullRequests);
    readCheckStatus.mockReturnValue({ bucket: PENDING_BUCKET, description: "", name: CHECK_NAME });
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });

    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Idle,
      reason: runningReason,
      retriggerDelaySeconds: getRetriggerDelaySeconds(PENDING_CHECK_WAIT_MS),
      targetSha: undefined,
    });
    expect(readSha(`origin/${DEVELOP_BRANCH}`)).toBe(developSha);
    expect(runDrainStep).not.toHaveBeenCalled();
  });

  // CodeRabbit reads the guard from the window the next one stacks on, so `main` listing the windows does not open one
  // Over a window whose own copy lacks the list
  test("opens nothing over an open window whose own copy lacks the stacking guard, though main carries it", async () => {
    expect.hasAssertions();

    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
    const configSha = publish(MAIN_BRANCH, commitFile(".coderabbit.yaml", stackingConfig));
    publish(DEVELOP_BRANCH, configSha);
    publish(getWindowBranch(pullRequest), deleteFile(".coderabbit.yaml"));
    publish(QUEUE_BRANCH, commitFile(TEST_FILENAME, ""));
    answerGh(openPullRequests);
    readCheckStatus.mockReturnValue({ bucket: PENDING_BUCKET, description: "", name: CHECK_NAME });
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });

    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Idle,
      reason: runningReason,
      retriggerDelaySeconds: getRetriggerDelaySeconds(PENDING_CHECK_WAIT_MS),
      targetSha: undefined,
    });
    expect(getPrCalls("create")).toHaveLength(0);
  });

  // A window stacked over an open one is cut from the top of the stack, its base the window below it
  test("stacks the next window over an open one when its base's config lets the stack reach it", async () => {
    expect.hasAssertions();

    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
    const configSha = publish(MAIN_BRANCH, commitFile(".coderabbit.yaml", stackingConfig));
    const developSha = publish(DEVELOP_BRANCH, configSha);
    publish(getWindowBranch(pullRequest), developSha);
    const queueSha = publish(QUEUE_BRANCH, commitFile(TEST_FILENAME, ""));
    answerGh(openPullRequests);
    readCheckStatus.mockReturnValue({ bucket: PENDING_BUCKET, description: "", name: CHECK_NAME });
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });

    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Opened,
      reason: getOpenedReason(1, getWindowBranch(pullRequest)),
      retriggerDelaySeconds: OPENED_WINDOW_READ_DELAY_SECONDS,
      targetSha: queueSha,
    });
    // The body lists the window's commits, which the test does not restate: the flags around it are what is asserted
    expect(getPrCalls("create")[0]?.[0]?.slice(0, 9)).toStrictEqual([
      "pr",
      "create",
      "--base",
      getWindowBranch(pullRequest),
      "--head",
      getWindowBranch(1),
      "--title",
      `${WINDOW_TITLE} 1`,
      "--body",
    ]);
  });

  test("drains the window it merges, ports the queue behind the fixes and opens the next window", async () => {
    expect.hasAssertions();

    const developSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    const queueSha = publish(QUEUE_BRANCH, commitFile(TEST_FILENAME, ""));
    publish(getWindowBranch(pullRequest), developSha);
    answerGh(openPullRequests);
    readCheckStatus.mockReturnValue(completedCheck);
    runSession.mockResolvedValue({ isEnded: true });
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });

    expect(runDrainStep).toHaveBeenCalledTimes(1);
    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Opened,
      reason: getOpenedReason(1),
      retriggerDelaySeconds: OPENED_WINDOW_READ_DELAY_SECONDS,
      targetSha: queueSha,
    });
    expect(readSha(`origin/${DEVELOP_BRANCH}`)).toBe(queueSha);
  });

  // Fixes never wait for the queue: over one level with develop, the drain's commit is the whole window
  test("opens a window of the drained fixes alone over a queue that owes nothing", async () => {
    expect.hasAssertions();

    const developSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    publish(QUEUE_BRANCH, developSha);
    publish(getWindowBranch(pullRequest), developSha);
    const reviewFixesSha = publish(REVIEW_FIXES_BRANCH, commitFile(TEST_FILENAME, ""));
    answerGh(openPullRequests);
    readCheckStatus.mockReturnValue(completedCheck);
    runSession.mockResolvedValue({ isEnded: true });
    runDrainStep.mockResolvedValue({ reviewFixesSha } satisfies DrainStepResult);
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });
    const targetSha = readSha(`origin/${DEVELOP_BRANCH}`);

    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Opened,
      reason: getOpenedReason(1),
      retriggerDelaySeconds: OPENED_WINDOW_READ_DELAY_SECONDS,
      targetSha,
    });
    expect(runGit(["log", "--format=%s", `${developSha}..${targetSha}`], getCwd())).toBe(`${TEST_FILENAME}
`);
  });

  // A queue left behind develop is rewritten onto it before the port reads it — the ported commit drops, the owed
  // One re-parents, and the window is then a fast-forward to the queue's own new head
  test("rewrites a queue left behind develop and ports what it still owes", async () => {
    expect.hasAssertions();

    const mainSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    const portedSha = commitFile(TEST_FILENAME, "");
    publish(QUEUE_BRANCH, commitFile(`${TEST_FILENAME}.ts`, ""));
    switchTo(mainSha);
    runGit(["cherry-pick", "-x", "--quiet", portedSha], getCwd());
    const developSha = publish(DEVELOP_BRANCH, "HEAD");
    switchTo(mainSha);
    answerGh([]);
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });
    const queueSha = readSha(`origin/${QUEUE_BRANCH}`);

    expect(runGit(["log", "--format=%s", `${developSha}..${queueSha}`], getCwd())).toBe(`${TEST_FILENAME}.ts
`);
    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Opened,
      reason: getOpenedReason(1),
      retriggerDelaySeconds: OPENED_WINDOW_READ_DELAY_SECONDS,
      targetSha: queueSha,
    });
    expect(readSha(`origin/${DEVELOP_BRANCH}`)).toBe(queueSha);
  });

  // The lease is the compare-and-swap: a develop that moved under the run is refused and reported, never overwritten,
  // And since no push to develop fires a run, the run wakes itself to measure again
  test("reports a develop that moved during the run and pushes nothing over it", async () => {
    expect.hasAssertions();

    const developSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    publish(QUEUE_BRANCH, commitFile(TEST_FILENAME, ""));
    switchTo(developSha);
    const movedSha = publish(TEST_FILENAME, commitFile(TEST_FILENAME, ""));
    installPreReceiveHook(`env -u GIT_QUARANTINE_PATH git update-ref refs/heads/${DEVELOP_BRANCH} ${movedSha}`);
    answerGh([]);
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });

    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Idle,
      reason: `${DEVELOP_BRANCH} moved during the run — nothing pushed, the next run re-measures`,
      retriggerDelaySeconds: MOVED_BRANCH_RETRY_DELAY_SECONDS,
      targetSha: undefined,
    });
    expect(readSha(`origin/${DEVELOP_BRANCH}`)).toBe(movedSha);
    expect(getPrCalls("create")).toHaveLength(0);
  });

  // The one review completing is the window, whatever it found and whatever the queue holds: its head is named in
  // The merge itself, and its findings are drained straight after
  test("merges the bottom window once its review completes, then drains it", async () => {
    expect.hasAssertions();

    const developSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    publish(QUEUE_BRANCH, commitFile(TEST_FILENAME, ""));
    const headSha = publish(getWindowBranch(pullRequest), developSha);
    answerGh(openPullRequests);
    readCheckStatus.mockReturnValue(completedCheck);
    runSession.mockResolvedValue({ isEnded: true });
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });

    expect(getPrCalls("merge")).toStrictEqual([
      [["pr", "merge", pullRequest.toString(), "--merge", "--admin", "--match-head-commit", headSha]],
    ]);
    expect(runDrainStep).toHaveBeenCalledTimes(1);
    expect(outcome.reason).toBe(getOpenedReason(1));
  });

  // The window above a merge is retargeted to `main` before the merged branch goes. When that retarget fails the run ends
  // There, so nothing merges over a base that is not `main` yet, and the merged branch stays for the next run to retarget
  test("ends the run without merging the window above when its retarget fails", async () => {
    expect.hasAssertions();

    const developSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    publish(QUEUE_BRANCH, commitFile(TEST_FILENAME, ""));
    publish(getWindowBranch(pullRequest), developSha);
    const windowAbove = {
      ...getWindowPullRequest(WindowPullRequestState.Open, pullRequest + 1),
      baseRefName: getWindowBranch(pullRequest),
    };
    answerGh([...openPullRequests, windowAbove]);
    const answer = runGh.getMockImplementation();
    runGh.mockImplementation((args) => {
      if (args[0] === "pr" && args[1] === "edit") throw new Error("the retarget was refused");
      return answer?.(args) ?? "";
    });
    readCheckStatus.mockReturnValue(completedCheck);
    runSession.mockResolvedValue({ isEnded: true });
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });

    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Idle,
      reason: `pull request #${windowAbove.number} could not be retargeted to ${MAIN_BRANCH} — the next run retargets it before it reads the stack`,
      retriggerDelaySeconds: ATTEMPT_RETRY_DELAY_SECONDS,
      targetSha: undefined,
    });
    expect(getPrCalls("merge")).toHaveLength(1);
    expect(runDrainStep).toHaveBeenCalledTimes(1);
    expect(readSha(`origin/${getWindowBranch(pullRequest)}`)).toBe(developSha);
  });

  // A drain that could not finish ended the run that merged it: the next run drains it again first, and nothing is cut
  // Over it while its findings are still open
  test("cuts nothing over the newest merged window while its drain cannot start", async () => {
    expect.hasAssertions();

    publish(DEVELOP_BRANCH, MAIN_BRANCH);
    publish(QUEUE_BRANCH, commitFile(TEST_FILENAME, ""));
    answerGh([getWindowPullRequest(WindowPullRequestState.Merged)]);
    runDrainStep.mockRejectedValue(new SessionUnstartedError());

    await expect(runCycle({ ...baseInput, cwd: getCwd() })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[SessionUnstartedError: Invalid operation: Read, name: coderabbit, no session started - the launch wrote nothing]`,
    );
    expect(runDrainStep.mock.calls[0]?.[0]?.pullRequest).toBe(pullRequest);
    expect(getPrCalls("create")).toHaveLength(0);
  });

  // The release from `develop` that a person merged by hand has its findings drained like a merged window's, before the
  // First cut over `main`
  test("drains the release from develop that a person merged before the first cut", async () => {
    expect.hasAssertions();

    publish(DEVELOP_BRANCH, MAIN_BRANCH);
    publish(QUEUE_BRANCH, commitFile(TEST_FILENAME, ""));
    answerGh([], [], [], [], [], [getLegacyPullRequest(WindowPullRequestState.Merged)]);
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });

    expect(runDrainStep.mock.calls[0]?.[0]?.pullRequest).toBe(pullRequest);
    expect(outcome.reason).toBe(getOpenedReason(1));
  });

  // Its findings are drained after the merge, so a merge no session could follow ships them unread until the
  // Limit lifts: the probe's refusal leaves the window open
  test("leaves a reviewed window open when no session can start to drain it", async () => {
    expect.hasAssertions();

    const developSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    publish(QUEUE_BRANCH, commitFile(TEST_FILENAME, ""));
    publish(getWindowBranch(pullRequest), developSha);
    answerGh(openPullRequests);
    readCheckStatus.mockReturnValue(completedCheck);
    runSession.mockRejectedValue(new SessionLimitedError(0));

    await expect(runCycle({ ...baseInput, cwd: getCwd() })).rejects.toStrictEqual(new SessionLimitedError(0));
    expect(getPrCalls("merge")).toHaveLength(0);
    expect(readSha(`origin/${DEVELOP_BRANCH}`)).toBe(developSha);
  });

  // A launch that wrote nothing ends the pass where it stood, which the entry point retries as an outage: the window
  // Merges only once a session can follow it
  test("leaves a reviewed window open when the probe's launch writes nothing", async () => {
    expect.hasAssertions();

    const developSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    publish(QUEUE_BRANCH, commitFile(TEST_FILENAME, ""));
    publish(getWindowBranch(pullRequest), developSha);
    answerGh(openPullRequests);
    readCheckStatus.mockReturnValue(completedCheck);
    runSession.mockRejectedValue(new SessionUnstartedError());

    await expect(runCycle({ ...baseInput, cwd: getCwd() })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[SessionUnstartedError: Invalid operation: Read, name: coderabbit, no session started - the launch wrote nothing]`,
    );
    expect(getPrCalls("merge")).toHaveLength(0);
    expect(readSha(`origin/${DEVELOP_BRANCH}`)).toBe(developSha);
  });

  // A probe that tried is retried as a failed attempt is, with no event behind it
  test("leaves a reviewed window open and wakes the cycle when the session probe exits non-zero", async () => {
    expect.hasAssertions();

    const developSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    publish(QUEUE_BRANCH, commitFile(TEST_FILENAME, ""));
    publish(getWindowBranch(pullRequest), developSha);
    answerGh(openPullRequests);
    readCheckStatus.mockReturnValue(completedCheck);
    runSession.mockResolvedValue({ isEnded: false });

    await expect(runCycle({ ...baseInput, cwd: getCwd() })).resolves.toStrictEqual({
      kind: CycleOutcomeKind.Idle,
      reason: "the session probe exited non-zero — the window waits for a session that can drain its findings",
      retriggerDelaySeconds: ATTEMPT_RETRY_DELAY_SECONDS,
      targetSha: undefined,
    });
    expect(getPrCalls("merge")).toHaveLength(0);
    expect(readSha(`origin/${DEVELOP_BRANCH}`)).toBe(developSha);
  });

  test("merges nothing and ports nothing while a session limit it marked has not lifted", async () => {
    expect.hasAssertions();

    const developSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    publish(QUEUE_BRANCH, commitFile(TEST_FILENAME, ""));
    const resetAt = new Date(Date.now() + Temporal.Duration.from({ hours: 1 }).total("milliseconds")).toISOString();
    answerGh(openPullRequests, [], [getMarked(`<!-- ${SESSION_LIMITED_MARKER} until ${resetAt} -->`)]);
    readCheckStatus.mockReturnValue(completedCheck);
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });

    // The reset is an hour and its buffer out, so the wake is one longest sleep, relayed to what is left
    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Idle,
      reason: `the session is limited until ${resetAt} — nothing merges or ports until a session can follow it`,
      retriggerDelaySeconds: Temporal.Duration.from({ milliseconds: RETRIGGER_SLEEP_CAP_MS }).total("seconds"),
      targetSha: undefined,
    });
    expect(runSession).not.toHaveBeenCalled();
    expect(getPrCalls("merge")).toHaveLength(0);
    expect(readSha(`origin/${DEVELOP_BRANCH}`)).toBe(developSha);
  });

  // The ceiling turns over on the clock and no event reports it, so the run that finds every opening of the hour spent
  // Wakes the cycle once the oldest of them ages out
  test("wakes the cycle when the hourly ceiling turns over while it holds the queue's next window", async () => {
    expect.hasAssertions();

    const nowMs = Temporal.Duration.from({ minutes: 50 }).total("milliseconds");
    vi.useFakeTimers({ now: nowMs, toFake: ["Date"] });
    publish(DEVELOP_BRANCH, MAIN_BRANCH);
    publish(QUEUE_BRANCH, commitFile(TEST_FILENAME, ""));
    answerGh(
      Array.from({ length: REVIEWS_PER_HOUR }, (_value, index) =>
        getWindowPullRequest(WindowPullRequestState.Merged, index),
      ),
    );
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });

    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Idle,
      reason: `no window opens — the hourly ceiling or the stacking guard holds for ${DEVELOP_BRANCH}`,
      retriggerDelaySeconds: Temporal.Duration.from({
        milliseconds: WINDOW_OPENING_WINDOW_MS - nowMs + RETRIGGER_BUFFER_MS,
      }).total("seconds"),
      targetSha: undefined,
    });
    expect(getPrCalls("create")).toHaveLength(0);
  });

  // The hour is the one budget, so the plan's figure of windows open is no reason to sleep through the slot it gives back
  test("wakes the cycle when the hour turns over with the plan's figure of windows open", async () => {
    expect.hasAssertions();

    const nowMs = Temporal.Duration.from({ minutes: 50 }).total("milliseconds");
    vi.useFakeTimers({ now: nowMs, toFake: ["Date"] });
    const configSha = publish(MAIN_BRANCH, commitFile(".coderabbit.yaml", stackingConfig));
    publish(DEVELOP_BRANCH, configSha);
    publish(getWindowBranch(REVIEWS_PER_HOUR - 1), configSha);
    publish(QUEUE_BRANCH, commitFile(TEST_FILENAME, ""));
    const windowNumbers = Array.from({ length: REVIEWS_PER_HOUR }, (_value, index) => index);
    answerGh(
      windowNumbers.map((number) => ({
        ...getWindowPullRequest(WindowPullRequestState.Open, number),
        baseRefName: number === 0 ? MAIN_BRANCH : getWindowBranch(number - 1),
      })),
    );
    // The bottom review started a moment ago, so its pending wait ends after the hour turns over
    const answerRest = runGh.getMockImplementation();
    runGh.mockImplementation((args) =>
      args[0] === "pr" && args[1] === "view" ? new Date(nowMs).toISOString() : (answerRest?.(args) ?? ""),
    );
    readCheckStatus.mockReturnValue({ bucket: PENDING_BUCKET, description: "", name: CHECK_NAME });
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });

    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Idle,
      reason: [
        `pull request #${pullRequest} — the review is running; asked for once it has waited until ${new Date(nowMs + PENDING_CHECK_WAIT_MS).toISOString()}`,
        ...windowNumbers.slice(1).map((number) => `pull request #${number} — the review is running`),
      ].join("; "),
      retriggerDelaySeconds: Temporal.Duration.from({
        milliseconds: WINDOW_OPENING_WINDOW_MS - nowMs + RETRIGGER_BUFFER_MS,
      }).total("seconds"),
      targetSha: undefined,
    });
    expect(getPrCalls("create")).toHaveLength(0);
  });

  // A named pull request picks which merged window to drain when none is open, never a window past an open one:
  // Pushed under it, the window would merge with the review unread
  test("waits on an open window when a pull request is named", async () => {
    expect.hasAssertions();

    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
    const developSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    publish(QUEUE_BRANCH, commitFile(TEST_FILENAME, ""));
    answerGh(openPullRequests);
    readCheckStatus.mockReturnValue({ bucket: PENDING_BUCKET, description: "", name: CHECK_NAME });
    const outcome = await runCycle({ ...baseInput, cwd: getCwd(), pullRequest });

    expect(outcome.reason).toBe(runningReason);
    expect(runDrainStep).not.toHaveBeenCalled();
    expect(readSha(`origin/${DEVELOP_BRANCH}`)).toBe(developSha);
  });

  test("asks for the review a rate limit refused rather than porting", async () => {
    expect.hasAssertions();

    const developSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    publish(QUEUE_BRANCH, commitFile(TEST_FILENAME, ""));
    answerGh(openPullRequests);
    readCheckStatus.mockReturnValue({ bucket: PASS_BUCKET, description: RATE_LIMITED_DESCRIPTION, name: CHECK_NAME });
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });

    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Idle,
      reason: `pull request #${pullRequest} — asked 1 of ${REVIEW_ASK_WAITS_MS.length} times for the review the limit refused — its answer fires the cycle again`,
      retriggerDelaySeconds: getRetriggerDelaySeconds(takeOne(REVIEW_ASK_WAITS_MS, 0)),
      targetSha: undefined,
    });
    expect(getPrCalls("comment")).toStrictEqual([
      [["pr", "comment", pullRequest.toString(), "--body", `${PROBE_COMMENT}\n<!-- ${REVIEW_ASK_MARKER} -->`]],
    ]);
    expect(readSha(`origin/${DEVELOP_BRANCH}`)).toBe(developSha);
  });

  // What lands on main after the window went out — a repair, an express cut — can conflict with the window, and a
  // Merge GitHub cannot create fails every run: main is folded into the window and the fold pushed to main itself,
  // Which GitHub reads as the pull request merged
  test("pushes a fold to main when the reviewed window conflicts with it", async () => {
    expect.hasAssertions();

    const baseSha = commitFile(TEST_FILENAME, "");
    const mainSha = publish(MAIN_BRANCH, commitFile(TEST_FILENAME, " "));
    switchTo(baseSha);
    const developSha = publish(DEVELOP_BRANCH, deleteFile(TEST_FILENAME));
    publish(QUEUE_BRANCH, developSha);
    publish(getWindowBranch(pullRequest), developSha);
    answerGh(openPullRequests);
    readCheckStatus.mockReturnValue(completedCheck);
    // The probe first, which asks only whether a session starts
    runSession.mockResolvedValueOnce({ isEnded: true });
    runSession.mockImplementation(() => {
      writeFileSync(join(getCwd(), TEST_FILENAME), " ");
      runGit(["add", TEST_FILENAME], getCwd());
      runGit(["commit", "--quiet", "--no-edit"], getCwd());
      return Promise.resolve({ isEnded: true });
    });
    await runCycle({ ...baseInput, cwd: getCwd() });
    const foldedSha = readSha(`origin/${MAIN_BRANCH}`);

    expect(runGit(["rev-list", "--parents", "--max-count=1", foldedSha], getCwd()).trim()).toBe(
      `${foldedSha} ${developSha} ${mainSha}`,
    );
    expect(readSha(`origin/${DEVELOP_BRANCH}`)).toBe(developSha);
    expect(getPrCalls("merge")).toHaveLength(0);
  });

  // A main that moved but still merges cleanly is GitHub's to merge
  test("merges a reviewed window over a main it diverged from without conflict", async () => {
    expect.hasAssertions();

    const baseSha = readSha("HEAD");
    publish(MAIN_BRANCH, commitFile(TEST_FILENAME, ""));
    switchTo(baseSha);
    const developSha = publish(DEVELOP_BRANCH, commitFile(`${TEST_FILENAME}.ts`, ""));
    publish(QUEUE_BRANCH, developSha);
    const headSha = publish(getWindowBranch(pullRequest), developSha);
    answerGh(openPullRequests);
    readCheckStatus.mockReturnValue(completedCheck);
    runSession.mockResolvedValue({ isEnded: true });
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });

    expect(getPrCalls("merge")).toStrictEqual([
      [["pr", "merge", pullRequest.toString(), "--merge", "--admin", "--match-head-commit", headSha]],
    ]);
    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Opened,
      reason: getOpenedReason(1),
      retriggerDelaySeconds: OPENED_WINDOW_READ_DELAY_SECONDS,
      targetSha: developSha,
    });
    expect(readSha(`origin/${DEVELOP_BRANCH}`)).toBe(developSha);
  });
});
