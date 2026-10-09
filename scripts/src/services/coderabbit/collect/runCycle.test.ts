import type { CheckStatus } from "#src/models/coderabbit/collect/CheckStatus";
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
  COMPLETED_DESCRIPTION,
  DEVELOP_BRANCH,
  EXPRESS_TRAILER,
  INSTALL_COMMAND,
  INSTALL_OUTPUT_MAX_BUFFER_BYTES,
  MAIN_BRANCH,
  PASS_BUCKET,
  PENDING_BUCKET,
  QUEUE_BRANCH,
  RATE_LIMITED_DESCRIPTION,
  REPAIR_ATTEMPT_TIMEOUT_MS,
  REPAIR_EXHAUSTED_MARKER,
  REPAIR_FAILED_MARKER,
  REPAIR_REGENERATE_COMMANDS,
  RETRIGGER_BUFFER_MS,
  RETRIGGER_SLEEP_CAP_MS,
  REVIEW_FIXES_BRANCH,
  SESSION_ATTEMPT_CAP,
  SESSION_LIMITED_MARKER,
  WINDOW_OPENING_WINDOW_MS,
  WINDOW_RECUT_MARKER,
  WINDOW_TITLE,
} from "#src/services/coderabbit/collect/constants";
import { FIXTURE_TEST_TIMEOUT_MS, TEST_FILENAME } from "#src/services/coderabbit/collect/constants.test";
import { getFailureSignature } from "#src/services/coderabbit/collect/getFailureSignature";
import { getMarker } from "#src/services/coderabbit/collect/getMarker";
import { getRepairPrompt } from "#src/services/coderabbit/collect/getRepairPrompt";
import { getRepairTrailer } from "#src/services/coderabbit/collect/getRepairTrailer";
import { getWindowBranch } from "#src/services/coderabbit/collect/getWindowBranch";
import { runCycle } from "#src/services/coderabbit/collect/runCycle";
import { setupFixtureRepository } from "#src/services/coderabbit/collect/setupFixtureRepository.test";
import { PROBE_COMMENT, REVIEWS_PER_HOUR } from "#src/services/coderabbit/shared/constants";
import { runGit } from "#src/services/shared/runGit";
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
  const { commitFile, deleteFile, getCwd, installPreReceiveHook, publish, readSha, switchTo } =
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
  const redRun: MainCheck = { conclusion: CI_FAILURE_CONCLUSION, databaseId: 0, status: CI_COMPLETED_STATUS, url: "" };
  // What the red run failed on, and the signature its repairs are counted under
  const redRunJobs: RunJobsView = { jobs: [{ conclusion: CI_FAILURE_CONCLUSION, name: "" }], workflowName: "" };
  const signature = getFailureSignature(
    redRunJobs.workflowName,
    redRunJobs.jobs.map(({ name }) => name),
  );
  const greenSpawn: SpawnSyncReturns<string> = { output: [], pid: 0, signal: null, status: 0, stderr: "", stdout: "" };
  const repairedReason = `${MAIN_BRANCH} repaired — its push runs the cycle again`;
  // What `gh` answers: the login, the window pull requests, the reviews, the issue comments, the repository's newest
  // Commit comments, CI's runs for main's head, a red run's jobs and log, no open issue, and `[[]]` for every other
  // Paginated list — the one page of nothing a `--slurp` returns. The pull requests are kept as GitHub would hold them:
  // A merge closes its window and a create opens one, so a run reads back what it wrote. Every commit comment is dated
  // At the epoch, so a test reading them pins the clock there
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
      } else if (args[0] === "run" && args[1] === "list") return JSON.stringify(mainChecks);
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

  // A release merge carries its reviewed develop head's tree, so CI's verdict there is main's before main's own
  // Run concludes: the cycle the merge fires repairs it rather than the one CI's conclusion fires later
  test("repairs a merged release red on its reviewed head while main's own run is going", async () => {
    expect.hasAssertions();

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
      else return JSON.stringify([{ ...redRun, conclusion: "", status: "in_progress" }]);
    });
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
      getRepairPrompt({
        collectorSha,
        failedLog: "",
        installFailure: installTail,
        mainSha,
        remainingMinutes: Temporal.Duration.from({ milliseconds: REPAIR_ATTEMPT_TIMEOUT_MS }).total("minutes"),
        runUrl: redRun.url,
      }),
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

    const mainSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    const developSha = publish(DEVELOP_BRANCH, commitFile(TEST_FILENAME, ""));
    commitFile(TEST_FILENAME, " ");
    publish(QUEUE_BRANCH, claimExpress());
    answerGh(openPullRequests);
    readCheckStatus.mockReturnValue({ bucket: PENDING_BUCKET, description: "", name: CHECK_NAME });
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });

    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Idle,
      reason: `pull request #${pullRequest} — the review is running`,
      retriggerDelaySeconds: undefined,
      targetSha: undefined,
    });
    expect(readSha(`origin/${MAIN_BRANCH}`)).toBe(mainSha);
    expect(readSha(`origin/${DEVELOP_BRANCH}`)).toBe(developSha);
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
  // The collector moves on
  test("opens one issue and repairs nothing once a signature is past its attempts", async () => {
    expect.hasAssertions();

    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
    const mainSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    publish(QUEUE_BRANCH, mainSha);
    answerGh([], [], [], getSignatureAttempts(SESSION_ATTEMPT_CAP), [redRun]);
    await runCycle({ ...baseInput, cwd: getCwd() });
    const issueCreates = runGh.mock.calls.filter(([args]) => args[0] === "issue" && args[1] === "create");
    const createArgs = issueCreates[0]?.[0] ?? [];

    expect(issueCreates).toHaveLength(1);
    expect(createArgs[createArgs.indexOf("--body") + 1]?.split("\n")[0]).toBe(
      getMarker(REPAIR_EXHAUSTED_MARKER, signature, [collectorSha]),
    );
    expect(runSession).not.toHaveBeenCalled();
    expect(getCommitCommentPosts(mainSha)).toHaveLength(0);
  });

  // One commit is the whole of what the queue owed — the port stops only at the cap or on a conflict — so there
  // Is nothing a size floor could wait for. The queue sits on develop's head, so the window is a fast-forward to
  // The queue's own sha.
  test("pushes a single owed commit and opens the first window over it", async () => {
    expect.hasAssertions();

    publish(DEVELOP_BRANCH, MAIN_BRANCH);
    const queueSha = publish(QUEUE_BRANCH, commitFile(TEST_FILENAME, ""));
    answerGh([]);
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });

    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Opened,
      reason: getOpenedReason(1),
      retriggerDelaySeconds: undefined,
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
      retriggerDelaySeconds: undefined,
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
      retriggerDelaySeconds: undefined,
      targetSha: firstSha,
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
      retriggerDelaySeconds: undefined,
      targetSha: queueSha,
    });
    expect(readSha(`origin/${DEVELOP_BRANCH}`)).toBe(queueSha);
  });

  test("holds every window while the release from develop is still reviewing", async () => {
    expect.hasAssertions();

    const developSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    publish(QUEUE_BRANCH, commitFile(TEST_FILENAME, ""));
    answerGh([], [], [], [], [], [getLegacyPullRequest(WindowPullRequestState.Open)]);
    readCheckStatus.mockReturnValue({ bucket: PENDING_BUCKET, description: "", name: CHECK_NAME });
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });

    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Idle,
      reason: `pull request #${pullRequest} from ${DEVELOP_BRANCH} to ${MAIN_BRANCH} is open — no window opens until its review completes and it merges`,
      retriggerDelaySeconds: undefined,
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

  test("opens nothing over an open window while no stacking guard reaches it", async () => {
    expect.hasAssertions();

    const developSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    publish(QUEUE_BRANCH, commitFile(TEST_FILENAME, ""));
    answerGh(openPullRequests);
    readCheckStatus.mockReturnValue({ bucket: PENDING_BUCKET, description: "", name: CHECK_NAME });
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });

    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Idle,
      reason: `pull request #${pullRequest} — the review is running`,
      retriggerDelaySeconds: undefined,
      targetSha: undefined,
    });
    expect(readSha(`origin/${DEVELOP_BRANCH}`)).toBe(developSha);
    expect(runDrainStep).not.toHaveBeenCalled();
  });

  // CodeRabbit reads the guard from the window the next one stacks on, so `main` listing the windows does not open one
  // Over a window whose own copy lacks the list
  test("opens nothing over an open window whose own copy lacks the stacking guard, though main carries it", async () => {
    expect.hasAssertions();

    const configSha = publish(MAIN_BRANCH, commitFile(".coderabbit.yaml", stackingConfig));
    publish(DEVELOP_BRANCH, configSha);
    publish(getWindowBranch(pullRequest), deleteFile(".coderabbit.yaml"));
    publish(QUEUE_BRANCH, commitFile(TEST_FILENAME, ""));
    answerGh(openPullRequests);
    readCheckStatus.mockReturnValue({ bucket: PENDING_BUCKET, description: "", name: CHECK_NAME });
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });

    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Idle,
      reason: `pull request #${pullRequest} — the review is running`,
      retriggerDelaySeconds: undefined,
      targetSha: undefined,
    });
    expect(getPrCalls("create")).toHaveLength(0);
  });

  // A window stacked over an open one is cut from the top of the stack, its base the window below it
  test("stacks the next window over an open one when its base's config lets the stack reach it", async () => {
    expect.hasAssertions();

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
      retriggerDelaySeconds: undefined,
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
      retriggerDelaySeconds: undefined,
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
      retriggerDelaySeconds: undefined,
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
      retriggerDelaySeconds: undefined,
      targetSha: queueSha,
    });
    expect(readSha(`origin/${DEVELOP_BRANCH}`)).toBe(queueSha);
  });

  // The lease is the compare-and-swap: a develop that moved under the run is refused and reported, never overwritten
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
      retriggerDelaySeconds: undefined,
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
    readCheckStatus.mockReturnValue({ bucket: PENDING_BUCKET, description: "", name: CHECK_NAME });
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });

    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Idle,
      reason: windowNumbers.map((number) => `pull request #${number} — the review is running`).join("; "),
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

    const developSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    publish(QUEUE_BRANCH, commitFile(TEST_FILENAME, ""));
    answerGh(openPullRequests);
    readCheckStatus.mockReturnValue({ bucket: PENDING_BUCKET, description: "", name: CHECK_NAME });
    const outcome = await runCycle({ ...baseInput, cwd: getCwd(), pullRequest });

    expect(outcome.reason).toBe(`pull request #${pullRequest} — the review is running`);
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
      reason: "asked for the review the limit refused — the bot's answer fires the cycle again",
      retriggerDelaySeconds: undefined,
      targetSha: undefined,
    });
    expect(getPrCalls("comment")).toStrictEqual([[["pr", "comment", pullRequest.toString(), "--body", PROBE_COMMENT]]]);
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
      retriggerDelaySeconds: undefined,
      targetSha: developSha,
    });
    expect(readSha(`origin/${DEVELOP_BRANCH}`)).toBe(developSha);
  });
});
