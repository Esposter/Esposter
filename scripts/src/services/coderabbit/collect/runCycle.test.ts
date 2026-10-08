import type { CheckStatus } from "#src/models/coderabbit/collect/CheckStatus";
import type { DrainStepResult } from "#src/models/coderabbit/collect/DrainStepResult";
import type { MainCheck } from "#src/models/coderabbit/collect/MainCheck";
import type { WindowPullRequest } from "#src/models/coderabbit/collect/WindowPullRequest";
import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";
import type { GitHubReview } from "#src/models/coderabbit/shared/GitHubReview";
import type { readCheckStatus as baseReadCheckStatus } from "#src/services/coderabbit/collect/readCheckStatus";
import type { runDrainStep as baseRunDrainStep } from "#src/services/coderabbit/collect/runDrainStep";
import type { runSession as baseRunSession } from "#src/services/coderabbit/collect/runSession";
import type { spawnPnpm as baseSpawnPnpm } from "#src/services/coderabbit/collect/spawnPnpm";
import type { runGh as baseRunGh } from "#src/services/shared/runGh";
import type { SpawnSyncReturns } from "node:child_process";

import { CycleOutcomeKind } from "#src/models/coderabbit/collect/CycleOutcomeKind";
import { SessionLimitedError } from "#src/models/coderabbit/collect/SessionLimitedError";
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
  HELD_MARKER,
  INSTALL_COMMAND,
  INSTALL_OUTPUT_MAX_BUFFER_BYTES,
  MAIN_BRANCH,
  PASS_BUCKET,
  PENDING_BUCKET,
  QUEUE_BRANCH,
  RATE_LIMITED_DESCRIPTION,
  REPAIR_FAILED_MARKER,
  REPAIR_REGENERATE_COMMANDS,
  RESHAPE_FAILED_MARKER,
  REVIEW_FIXES_BRANCH,
  SESSION_ATTEMPT_CAP,
  SESSION_LIMITED_MARKER,
  WINDOW_TITLE,
} from "#src/services/coderabbit/collect/constants";
import { FIXTURE_TEST_TIMEOUT_MS, TEST_FILENAME } from "#src/services/coderabbit/collect/constants.test";
import { getMarker } from "#src/services/coderabbit/collect/getMarker";
import { getRepairPrompt } from "#src/services/coderabbit/collect/getRepairPrompt";
import { getRepairTrailer } from "#src/services/coderabbit/collect/getRepairTrailer";
import { getWindowBranch } from "#src/services/coderabbit/collect/getWindowBranch";
import { runCycle } from "#src/services/coderabbit/collect/runCycle";
import { setupFixtureRepository } from "#src/services/coderabbit/collect/setupFixtureRepository.test";
import { PROBE_COMMENT, REVIEW_FILE_CAP } from "#src/services/coderabbit/shared/constants";
import { runGit } from "#src/services/shared/runGit";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test, vi } from "vitest";

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
    number,
    state,
  });
  const openPullRequests: WindowPullRequest[] = [getWindowPullRequest(WindowPullRequestState.Open)];
  const overflowPaths = Array.from({ length: REVIEW_FILE_CAP + 1 }, (_value, index) => `${TEST_FILENAME}/${index}`);

  // CI's verdict on main's head, red when a test says so, and what every `pnpm` the lane spawns answers
  const redRun: MainCheck = { conclusion: CI_FAILURE_CONCLUSION, databaseId: 0, status: CI_COMPLETED_STATUS, url: "" };
  const greenSpawn: SpawnSyncReturns<string> = { output: [], pid: 0, signal: null, status: 0, stderr: "", stdout: "" };
  // What `gh` answers: the login, the window pull requests, the reviews, the issue comments, every commit's comments,
  // CI's runs for main's head, a red run's log, and `[[]]` for every other paginated list — the one page of nothing a
  // `--slurp` returns. The pull requests are kept as GitHub would hold them: a merge closes its window and a create
  // Opens one, so a run reads back what it wrote
  const collectorSha = "collectorSha";
  const baseInput = { collectorSha, isDryRun: false };
  const answerGh = (
    windowPullRequests: WindowPullRequest[] = [],
    reviews: GitHubReview[] = [],
    issueComments: GitHubEntry[] = [],
    commitComments: GitHubEntry[] = [],
    mainChecks: MainCheck[] = [],
    legacyPullRequests: Pick<WindowPullRequest, "number" | "state">[] = [],
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
          number: windowPullRequestsNow.length + pullRequest + 1,
          state: WindowPullRequestState.Open,
        });
        return "";
      } else if (args[0] === "run" && args[1] === "list") return JSON.stringify(mainChecks);
      else if (args[0] === "run" && args[1] === "view") return "";
      else if (args[1]?.startsWith(`repos/{owner}/{repo}/pulls/${pullRequest}/reviews`))
        return JSON.stringify([reviews]);
      else if (args[1]?.startsWith(`repos/{owner}/{repo}/issues/${pullRequest}/comments`))
        return JSON.stringify([issueComments]);
      // The read is paginated where the post carries a body
      else if (args[1]?.startsWith("repos/{owner}/{repo}/commits/") && args.includes("--paginate"))
        return JSON.stringify([commitComments]);
      else return "[[]]";
    });
  };
  const getMarked = (marker: string): GitHubEntry => ({
    body: marker,
    id: 0,
    updated_at: "",
    user: { login: viewerLogin },
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
  // Shared window untouched
  test("repairs a red main with its own regenerators, spawning no session", async () => {
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
      reason: `${MAIN_BRANCH} repaired — the push runs the cycle again, which cuts the 0 claimed commits behind it`,
      targetSha: repairSha,
    });
    expect(runGit(["rev-list", "--parents", "--max-count=1", repairSha], getCwd()).trim()).toBe(
      `${repairSha} ${mainSha}`,
    );
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
      return Promise.resolve({ isEnded: false, isStarted: false });
    });
    await runCycle({ ...baseInput, cwd: getCwd() });

    expect(dirtyAtSession).toBe("");
  });

  // A head that does not install is a red like any other: no regenerator can run on it, and the session is handed
  // The install's own tail rather than the run ending on it uncounted
  test("hands a red main that does not install to the repairer with the install's tail", async () => {
    expect.hasAssertions();

    const mainSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    publish(QUEUE_BRANCH, mainSha);
    answerGh([], [], [], [], [redRun]);
    const installTail = "ERR_PNPM_LOCKFILE_CONFIG_MISMATCH";
    spawnPnpm.mockReturnValue({ ...greenSpawn, status: 1, stdout: installTail });
    let prompt = "";
    runSession.mockImplementation((input) => {
      ({ prompt } = input);
      return Promise.resolve({ isEnded: false, isStarted: false });
    });
    await runCycle({ ...baseInput, cwd: getCwd() });

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
      return Promise.resolve({ isEnded: true, isStarted: true });
    });
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });
    const repairSha = readSha(`origin/${MAIN_BRANCH}`);

    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Repaired,
      reason: `${MAIN_BRANCH} repaired — the push runs the cycle again, which cuts the 0 claimed commits behind it`,
      targetSha: repairSha,
    });
    expect(runGit(["rev-list", "--parents", "--max-count=1", repairSha], getCwd()).trim()).toBe(
      `${repairSha} ${mainSha}`,
    );
  });

  // A session's repair is verified as the cut it becomes, and one that fails there counts on main's head in the
  // Shape and under the marker the repairer's own count reads
  test("counts a repair that fails the checks as a cut on main's head and pushes nothing", async () => {
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
      return Promise.resolve({ isEnded: true, isStarted: true });
    });
    await runCycle({ ...baseInput, cwd: getCwd() });

    expect(readSha(`origin/${MAIN_BRANCH}`)).toBe(mainSha);
    expect(getCommitCommentPosts(mainSha)).toStrictEqual([
      [
        [
          "api",
          `repos/{owner}/{repo}/commits/${mainSha}/comments`,
          "-f",
          `body=${getMarker(REPAIR_FAILED_MARKER, mainSha, [collectorSha])}\nAttempt 1 of ${SESSION_ATTEMPT_CAP} to repair this red ${MAIN_BRANCH} head failed — the session left a repair that failed the checks as a cut. See the collector run.`,
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
  // Attempt on main's head and fails the run, as the fold does
  test("counts a repair that left no trailered commit on main's head and fails the run", async () => {
    expect.hasAssertions();

    const mainSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    publish(QUEUE_BRANCH, mainSha);
    answerGh([], [], [], [], [redRun]);
    spawnPnpm.mockReturnValue(greenSpawn);
    runSession.mockImplementation(() => {
      commitFile(TEST_FILENAME, "");
      return Promise.resolve({ isEnded: true, isStarted: true });
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
          `body=${getMarker(REPAIR_FAILED_MARKER, mainSha, [collectorSha])}\nAttempt 1 of ${SESSION_ATTEMPT_CAP} to repair this red ${MAIN_BRANCH} head failed. See the collector run.`,
        ],
      ],
    ]);
  });

  // One commit exactly, because the streak reads a repair off the head as a commit: a session that left two
  // Would stack two attempts on the head it made, and a third would hand an answerable red to a person
  test("counts a repair that left more than one commit on main's head and fails the run", async () => {
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
      return Promise.resolve({ isEnded: true, isStarted: true });
    });

    await expect(runCycle({ ...baseInput, cwd: getCwd() })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[AttemptFailedError: Invalid operation: Update, name: coderabbit, the repairer left 9107053724b5b317eae7437b5b6c689aa46d050c unrepaired (attempt 1 of 3)]`,
    );
    expect(readSha(`origin/${MAIN_BRANCH}`)).toBe(mainSha);
    expect(getCommitCommentPosts(mainSha)).toHaveLength(1);
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

  const getExhaustedReshapes = (sha: string): GitHubEntry[] =>
    Array.from({ length: SESSION_ATTEMPT_CAP }, (_value, id) => ({
      ...getMarked(getMarker(RESHAPE_FAILED_MARKER, sha, [collectorSha])),
      id,
    }));

  test("notes the queue's first commit on itself and fails the run when it overflows the cap past reshaping", async () => {
    expect.hasAssertions();

    const developSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    const heldSha = publish(QUEUE_BRANCH, commitFiles(overflowPaths, ""));
    answerGh([], [], [], getExhaustedReshapes(heldSha));

    await expect(runCycle({ ...baseInput, cwd: getCwd() })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Update, name: coderabbit, held at 53a34b50fab3524f0cd536a0bce4eaa4dfa21cb5 — the first owed commit could not be reshaped under the cap or its conflict was not resolved past the attempt cap, so a person splits it or rebases ai/queue (its commit comments say which)]`,
    );
    expect(readSha(`origin/${DEVELOP_BRANCH}`)).toBe(developSha);
    expect(getCommitCommentPosts(heldSha)).toStrictEqual([
      [
        [
          "api",
          `repos/{owner}/{repo}/commits/${heldSha}/comments`,
          "-f",
          `body=${getMarker(HELD_MARKER, heldSha)}\nHeld: this is the first commit \`${QUEUE_BRANCH}\` owes \`${DEVELOP_BRANCH}\`, and no window can take it — its reshaping under the file cap or its conflict with the tree the fixes built failed past the attempt cap (the comments above say which). Nothing behind it ports until a person splits or rebases it (\`.agents/skills/review-queue/SKILL.md\`).`,
        ],
      ],
    ]);
  });

  test("reports a held first commit on a dry run without noting or failing", async () => {
    expect.hasAssertions();

    publish(DEVELOP_BRANCH, MAIN_BRANCH);
    const heldSha = publish(QUEUE_BRANCH, commitFiles(overflowPaths, ""));
    answerGh([]);
    const outcome = await runCycle({ ...baseInput, cwd: getCwd(), isDryRun: true });

    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Idle,
      reason: `held at ${heldSha} — a dry run reshapes and resolves nothing`,
      retriggerDelaySeconds: undefined,
      targetSha: undefined,
    });
    expect(getCommitCommentPosts(heldSha)).toHaveLength(0);
  });

  test("notes a held commit once", async () => {
    expect.hasAssertions();

    publish(DEVELOP_BRANCH, MAIN_BRANCH);
    const heldSha = publish(QUEUE_BRANCH, commitFiles(overflowPaths, ""));
    answerGh([], [], [], [...getExhaustedReshapes(heldSha), getMarked(getMarker(HELD_MARKER, heldSha))]);

    await expect(runCycle({ ...baseInput, cwd: getCwd() })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Update, name: coderabbit, held at 53a34b50fab3524f0cd536a0bce4eaa4dfa21cb5 — the first owed commit could not be reshaped under the cap or its conflict was not resolved past the attempt cap, so a person splits it or rebases ai/queue (its commit comments say which)]`,
    );
    expect(getCommitCommentPosts(heldSha)).toHaveLength(0);
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

  test("opens nothing over develop while the release pull request from develop is open", async () => {
    expect.hasAssertions();

    const developSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    publish(QUEUE_BRANCH, commitFile(TEST_FILENAME, ""));
    answerGh([], [], [], [], [], [{ number: pullRequest, state: WindowPullRequestState.Open }]);
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });

    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Idle,
      reason: `pull request #${pullRequest} from ${DEVELOP_BRANCH} to ${MAIN_BRANCH} is open — no window opens over ${DEVELOP_BRANCH} until a person merges or closes it`,
      retriggerDelaySeconds: undefined,
      targetSha: undefined,
    });
    expect(getPrCalls("create")).toHaveLength(0);
    expect(readSha(`origin/${DEVELOP_BRANCH}`)).toBe(developSha);
  });

  test("pauses on a release pull request from develop that a person closed", async () => {
    expect.hasAssertions();

    publish(DEVELOP_BRANCH, MAIN_BRANCH);
    publish(QUEUE_BRANCH, commitFile(TEST_FILENAME, ""));
    answerGh([], [], [], [], [], [{ number: pullRequest, state: WindowPullRequestState.Closed }]);
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });

    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Idle,
      reason: `pull request #${pullRequest} from ${DEVELOP_BRANCH} to ${MAIN_BRANCH} was closed without merging — a person's pause`,
      retriggerDelaySeconds: undefined,
      targetSha: undefined,
    });
    expect(getPrCalls("create")).toHaveLength(0);
  });

  test("opens nothing over an open window while the stacking guard is not on main", async () => {
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

  // A window stacked over an open one is cut from the top of the stack, its base the window below it
  test("stacks the next window over an open one when main's config lets the stack reach it", async () => {
    expect.hasAssertions();

    const configSha = publish(
      MAIN_BRANCH,
      commitFile(".coderabbit.yaml", 'reviews:\n  auto_review:\n    base_branches: ["^review/"]\n'),
    );
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
    runSession.mockResolvedValue({ isEnded: true, isStarted: true });
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
    runSession.mockResolvedValue({ isEnded: true, isStarted: true });
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
    runSession.mockResolvedValue({ isEnded: true, isStarted: true });
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });

    expect(getPrCalls("merge")).toStrictEqual([
      [["pr", "merge", pullRequest.toString(), "--merge", "--admin", "--match-head-commit", headSha]],
    ]);
    expect(runDrainStep).toHaveBeenCalledTimes(1);
    expect(outcome.reason).toBe(getOpenedReason(1));
  });

  // The window above a merge is retargeted to `main` before the merged branch goes. When that retarget fails the run ends
  // there, so nothing merges over a base that is not `main` yet, and the merged branch stays for the next run to retarget
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
    runSession.mockResolvedValue({ isEnded: true, isStarted: true });
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

  test("leaves a reviewed window open when its session probe exits non-zero", async () => {
    expect.hasAssertions();

    const developSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    publish(QUEUE_BRANCH, commitFile(TEST_FILENAME, ""));
    publish(getWindowBranch(pullRequest), developSha);
    answerGh(openPullRequests);
    readCheckStatus.mockReturnValue(completedCheck);
    runSession.mockResolvedValue({ isEnded: false, isStarted: true });

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

    expect(outcome.reason).toBe(
      `the session is limited until ${resetAt} — nothing merges or ports until a session can follow it`,
    );
    expect(runSession).not.toHaveBeenCalled();
    expect(getPrCalls("merge")).toHaveLength(0);
    expect(readSha(`origin/${DEVELOP_BRANCH}`)).toBe(developSha);
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
    runSession.mockResolvedValueOnce({ isEnded: true, isStarted: true });
    runSession.mockImplementation(() => {
      writeFileSync(join(getCwd(), TEST_FILENAME), " ");
      runGit(["add", TEST_FILENAME], getCwd());
      runGit(["commit", "--quiet", "--no-edit"], getCwd());
      return Promise.resolve({ isEnded: true, isStarted: true });
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
    runSession.mockResolvedValue({ isEnded: true, isStarted: true });
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
