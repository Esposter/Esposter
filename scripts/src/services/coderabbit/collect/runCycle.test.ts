import type { CheckStatus } from "#src/models/coderabbit/collect/CheckStatus";
import type { DrainStepResult } from "#src/models/coderabbit/collect/DrainStepResult";
import type { MainCheck } from "#src/models/coderabbit/collect/MainCheck";
import type { ReleasePullRequest } from "#src/models/coderabbit/collect/ReleasePullRequest";
import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";
import type { GitHubReview } from "#src/models/coderabbit/shared/GitHubReview";
import type { judgeRelease as baseJudgeRelease } from "#src/services/coderabbit/collect/judgeRelease";
import type { readCheckStatus as baseReadCheckStatus } from "#src/services/coderabbit/collect/readCheckStatus";
import type { runDrainStep as baseRunDrainStep } from "#src/services/coderabbit/collect/runDrainStep";
import type { runSession as baseRunSession } from "#src/services/coderabbit/collect/runSession";
import type { spawnPnpm as baseSpawnPnpm } from "#src/services/coderabbit/collect/spawnPnpm";
import type { runGh as baseRunGh } from "#src/services/shared/runGh";
import type { SpawnSyncReturns } from "node:child_process";

import { CycleOutcomeKind } from "#src/models/coderabbit/collect/CycleOutcomeKind";
import { ReleasePullRequestState } from "#src/models/coderabbit/collect/ReleasePullRequestState";
import {
  CHECK_NAME,
  CI_FAILURE_CONCLUSION,
  COMPLETED_DESCRIPTION,
  DEVELOP_BRANCH,
  EXPRESS_TRAILER,
  HELD_MARKER,
  INSTALL_COMMAND,
  INSTALL_OUTPUT_MAX_BUFFER_BYTES,
  MAIN_BRANCH,
  MERGEABLE_RISK_LEVEL,
  PASS_BUCKET,
  PENDING_BUCKET,
  QUEUE_BRANCH,
  RECENT_REVIEW_MARKER,
  REPAIR_FAILED_MARKER,
  REPAIR_REGENERATE_COMMANDS,
  RESHAPE_FAILED_MARKER,
  REVIEW_FIXES_BRANCH,
  SESSION_ATTEMPT_CAP,
} from "#src/services/coderabbit/collect/constants";
import { FIXTURE_TEST_TIMEOUT_MS, TEST_FILENAME } from "#src/services/coderabbit/collect/constants.test";
import { getMarker } from "#src/services/coderabbit/collect/getMarker";
import { getRepairPrompt } from "#src/services/coderabbit/collect/getRepairPrompt";
import { getRepairTrailer } from "#src/services/coderabbit/collect/getRepairTrailer";
import { runCycle } from "#src/services/coderabbit/collect/runCycle";
import { setupFixtureRepository } from "#src/services/coderabbit/collect/setupFixtureRepository.test";
import { CODERABBIT_REST_LOGIN, REVIEW_FILE_CAP } from "#src/services/coderabbit/shared/constants";
import { runGit } from "#src/services/shared/runGit";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test, vi } from "vitest";

const { judgeRelease, readCheckStatus, runDrainStep, runGh, runSession, spawnPnpm } = vi.hoisted(() => ({
  judgeRelease: vi.fn<typeof baseJudgeRelease>(),
  readCheckStatus: vi.fn<typeof baseReadCheckStatus>(),
  runDrainStep: vi.fn<typeof baseRunDrainStep>(),
  runGh: vi.fn<typeof baseRunGh>(),
  runSession: vi.fn<typeof baseRunSession>(),
  spawnPnpm: vi.fn<typeof baseSpawnPnpm>(),
}));

// The seams the pass cannot reach from a fixture repository: `gh`, the check status it reads through
// `gh pr checks`, the steps that spawn Claude — the drain, the release verdict and the repairer's session — and
// The `pnpm` the repairer verifies a repair with. Git runs for real.
vi.mock(import("#src/services/shared/runGh"), () => ({ runGh: runGh as unknown as typeof baseRunGh }));

vi.mock(import("#src/services/coderabbit/collect/runSession"), () => ({
  runSession: runSession as unknown as typeof baseRunSession,
}));

vi.mock(import("#src/services/coderabbit/collect/spawnPnpm"), () => ({
  spawnPnpm: spawnPnpm as unknown as typeof baseSpawnPnpm,
}));

vi.mock(import("#src/services/coderabbit/collect/judgeRelease"), () => ({
  judgeRelease: judgeRelease as unknown as typeof baseJudgeRelease,
}));

vi.mock(import("#src/services/coderabbit/collect/readCheckStatus"), () => ({
  readCheckStatus: readCheckStatus as unknown as typeof baseReadCheckStatus,
}));

vi.mock(import("#src/services/coderabbit/collect/runDrainStep"), () => ({
  runDrainStep: runDrainStep as unknown as typeof baseRunDrainStep,
}));

// The bot's walkthrough after a review that found nothing: no review body, the range in the recent-review block
// And the merge risk it states for the head it read — the least unless a test says otherwise, and no block
// At all for `""`, which is the walkthrough it writes on some releases and not others
const getCleanWalkthrough = (sha: string, level = MERGEABLE_RISK_LEVEL): GitHubEntry => ({
  body: `<!-- ${RECENT_REVIEW_MARKER}_start -->between ${sha} and ${sha}<!-- ${RECENT_REVIEW_MARKER}_end -->${level === "" ? "" : `\n**Merge Risk:** _${TEST_FILENAME} ${level}_\n<!-- final_review_risk_coverage:{"sourceCommitId":"${sha}","coveredCommitId":"${sha}","kind":"reviewed"} -->`}`,
  id: 0,
  updated_at: "",
  user: { login: CODERABBIT_REST_LOGIN },
});

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
  const overflowPaths = Array.from({ length: REVIEW_FILE_CAP + 1 }, (_value, index) => `${TEST_FILENAME}/${index}`);
  // CI's verdict on main's head, red when a test says so, and what every `pnpm` the lane spawns answers
  const redRun: MainCheck = { conclusion: CI_FAILURE_CONCLUSION, databaseId: 0, status: "completed", url: "" };
  const greenSpawn: SpawnSyncReturns<string> = { output: [], pid: 0, signal: null, status: 0, stderr: "", stdout: "" };
  // What `gh` answers: the login, the release pull request list, the reviews, the issue comments, every commit's
  // Comments, CI's runs for main's head, a red run's log, and `[[]]` for every other paginated list — the one
  // Page of nothing a `--slurp` returns
  const collectorSha = "collectorSha";
  const baseInput = { collectorSha, isDryRun: false };
  const answerGh = (
    releasePullRequests: ReleasePullRequest[],
    reviews: GitHubReview[] = [],
    issueComments: GitHubEntry[] = [],
    commitComments: GitHubEntry[] = [],
    mainChecks: MainCheck[] = [],
  ) => {
    runGh.mockImplementation((args) => {
      if (args[1] === "user") return viewerLogin;
      else if (args[0] === "pr" && args[1] === "list") return JSON.stringify(releasePullRequests);
      else if (args[0] === "run" && args[1] === "list") return JSON.stringify(mainChecks);
      else if (args[0] === "run" && args[1] === "view") return "";
      else if (args[1]?.startsWith(`repos/{owner}/{repo}/pulls/${pullRequest}/reviews`))
        return JSON.stringify([reviews]);
      else if (args[1]?.startsWith(`repos/{owner}/{repo}/issues/${pullRequest}/comments`))
        return JSON.stringify([issueComments]);
      // The read is paginated where the post carries a body
      else if (args[1]?.startsWith("repos/{owner}/{repo}/commits/") && args.includes("--paginate"))
        return JSON.stringify([commitComments]);
      return "[[]]";
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

  // A claimed commit built on the window the release still reviews cannot apply to main, and no window carries it
  // Alone: the run says it waits rather than reporting a synced queue, and main is left where it was
  test("reports a claimed commit whose patch does not apply to main as waiting", async () => {
    expect.hasAssertions();

    const mainSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    const developSha = publish(DEVELOP_BRANCH, commitFile(TEST_FILENAME, ""));
    commitFile(TEST_FILENAME, " ");
    publish(QUEUE_BRANCH, claimExpress());
    answerGh([{ number: pullRequest, state: ReleasePullRequestState.Open }], [], [getCleanWalkthrough(developSha)]);
    readCheckStatus.mockReturnValue(completedCheck);
    runDrainStep.mockResolvedValue({ isClean: false, reviewFixesSha: undefined } satisfies DrainStepResult);
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });

    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Idle,
      reason: `1 claimed commits wait on the express lane — a patch that does not apply to ${MAIN_BRANCH} yet`,
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
  test("pushes a single owed commit and opens the release pull request over it", async () => {
    expect.hasAssertions();

    publish(DEVELOP_BRANCH, MAIN_BRANCH);
    const queueSha = publish(QUEUE_BRANCH, commitFile(TEST_FILENAME, ""));
    answerGh([]);
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });

    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Opened,
      reason: `the release: ${DEVELOP_BRANCH} → ${MAIN_BRANCH} pull request is open — its first review reads the whole window`,
      targetSha: queueSha,
    });
    expect(readSha(`origin/${DEVELOP_BRANCH}`)).toBe(queueSha);
    expect(getPrCalls("create")).toHaveLength(1);
  });

  // The last release merged and develop already carries the next window: nothing to port, only the pull request owed
  test("opens the release pull request over a develop that already carries the window", async () => {
    expect.hasAssertions();

    const developSha = publish(DEVELOP_BRANCH, commitFile(TEST_FILENAME, ""));
    publish(QUEUE_BRANCH, developSha);
    answerGh([]);
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });

    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Opened,
      reason: `the release: ${DEVELOP_BRANCH} → ${MAIN_BRANCH} pull request is open — its first review reads the whole window`,
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
      reason: `would fold ${MAIN_BRANCH} in and push the window to ${DEVELOP_BRANCH}, then open the release pull request`,
      retriggerDelaySeconds: undefined,
      targetSha: undefined,
    });
    expect(readSha(`origin/${DEVELOP_BRANCH}`)).toBe(developSha);
    expect(getPrCalls("create")).toHaveLength(0);
  });

  // A first commit over the cap is the reshaper's; past its attempts it can never fit and no event clears it, so
  // The commit is told once and the run fails red for a person
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
      `[InvalidOperationError: Invalid operation: Update, name: coderabbit, held at e1b1241d5399c7d8234f33a42c525fc449150d8c — the first owed commit could not be reshaped under the cap or its conflict was not resolved past the attempt cap, so a person splits it or rebases ai/queue (its commit comments say which)]`,
    );
    expect(readSha(`origin/${DEVELOP_BRANCH}`)).toBe(developSha);
    expect(getCommitCommentPosts(heldSha)).toStrictEqual([
      [
        [
          "api",
          `repos/{owner}/{repo}/commits/${heldSha}/comments`,
          "-f",
          expect.stringContaining(getMarker(HELD_MARKER, heldSha)),
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
      `[InvalidOperationError: Invalid operation: Update, name: coderabbit, held at e1b1241d5399c7d8234f33a42c525fc449150d8c — the first owed commit could not be reshaped under the cap or its conflict was not resolved past the attempt cap, so a person splits it or rebases ai/queue (its commit comments say which)]`,
    );
    expect(getCommitCommentPosts(heldSha)).toHaveLength(0);
  });

  test("opens nothing over a release pull request a person closed", async () => {
    expect.hasAssertions();

    publish(DEVELOP_BRANCH, MAIN_BRANCH);
    publish(QUEUE_BRANCH, commitFile(TEST_FILENAME, ""));
    answerGh([{ number: pullRequest, state: ReleasePullRequestState.Closed }]);
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });

    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Idle,
      reason: `pull request #${pullRequest} was closed without merging — a person's pause, re-open it to resume`,
      retriggerDelaySeconds: undefined,
      targetSha: undefined,
    });
    expect(getPrCalls("create")).toHaveLength(0);
  });

  test("exits at the gate while a review is running", async () => {
    expect.hasAssertions();

    const developSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    publish(QUEUE_BRANCH, commitFile(TEST_FILENAME, ""));
    answerGh([{ number: pullRequest, state: ReleasePullRequestState.Open }]);
    readCheckStatus.mockReturnValue({ bucket: PENDING_BUCKET, description: "", name: CHECK_NAME });
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });

    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Idle,
      reason: "a review is running — a push would cancel it",
      retriggerDelaySeconds: undefined,
      targetSha: undefined,
    });
    expect(readSha(`origin/${DEVELOP_BRANCH}`)).toBe(developSha);
    expect(runDrainStep).not.toHaveBeenCalled();
  });

  test("fails the run when the pull request carries no check to read", async () => {
    expect.hasAssertions();

    publish(DEVELOP_BRANCH, MAIN_BRANCH);
    publish(QUEUE_BRANCH, commitFile(TEST_FILENAME, ""));
    answerGh([{ number: pullRequest, state: ReleasePullRequestState.Open }]);
    readCheckStatus.mockReturnValue(undefined);

    await expect(runCycle({ ...baseInput, cwd: getCwd() })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: coderabbit, no CodeRabbit check on the pull request]`,
    );
  });

  // A review that found nothing writes no review body, so the frontier is read off the walkthrough's recent-review
  // Block; a range ending at develop's head is a free slot. A finding answered only by an unported commit keeps
  // The release from merging, so the window ports instead.
  test("drains, ports the queue behind the fixes and reports the window it pushed", async () => {
    expect.hasAssertions();

    const developSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    const queueSha = publish(QUEUE_BRANCH, commitFile(TEST_FILENAME, ""));
    answerGh([{ number: pullRequest, state: ReleasePullRequestState.Open }], [], [getCleanWalkthrough(developSha)]);
    readCheckStatus.mockReturnValue(completedCheck);
    runDrainStep.mockResolvedValue({ isClean: false, reviewFixesSha: undefined } satisfies DrainStepResult);
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });

    expect(runDrainStep).toHaveBeenCalledTimes(1);
    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Pushed,
      reason: `1 queue commits and 0 fix commits reached ${DEVELOP_BRANCH}`,
      retriggerDelaySeconds: undefined,
      targetSha: queueSha,
    });
    expect(readSha(`origin/${DEVELOP_BRANCH}`)).toBe(queueSha);
    expect(getPrCalls("merge")).toHaveLength(0);
  });

  // Fixes never wait for the queue: over one level with develop, the drain's commit is the whole window and
  // Spends the slot on the review the release waits for
  test("pushes the drained fixes alone over a queue that owes nothing", async () => {
    expect.hasAssertions();

    const developSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    publish(QUEUE_BRANCH, developSha);
    const reviewFixesSha = publish(REVIEW_FIXES_BRANCH, commitFile(TEST_FILENAME, ""));
    answerGh([{ number: pullRequest, state: ReleasePullRequestState.Open }], [], [getCleanWalkthrough(developSha)]);
    readCheckStatus.mockReturnValue(completedCheck);
    runDrainStep.mockResolvedValue({ isClean: false, reviewFixesSha } satisfies DrainStepResult);
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });
    const targetSha = readSha(`origin/${DEVELOP_BRANCH}`);

    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Pushed,
      reason: `0 queue commits and 1 fix commits reached ${DEVELOP_BRANCH}`,
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
      reason: `the release: ${DEVELOP_BRANCH} → ${MAIN_BRANCH} pull request is open — its first review reads the whole window`,
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
    });
    expect(readSha(`origin/${DEVELOP_BRANCH}`)).toBe(movedSha);
    expect(getPrCalls("create")).toHaveLength(0);
  });

  // A review that found nothing writes no review body: the frontier is read off the walkthrough's recent-review
  // Block, and a clean review at the head with the least merge risk is a release, whatever the queue holds
  test("merges the release pull request when the review at the head is clean", async () => {
    expect.hasAssertions();

    const developSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    publish(QUEUE_BRANCH, commitFile(TEST_FILENAME, ""));
    answerGh([{ number: pullRequest, state: ReleasePullRequestState.Open }], [], [getCleanWalkthrough(developSha)]);
    runDrainStep.mockResolvedValue({ isClean: true, reviewFixesSha: undefined } satisfies DrainStepResult);
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });

    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Merged,
      reason: `pull request #${pullRequest} merged — the push to ${MAIN_BRANCH} runs the return stroke`,
    });
    // The head the verdict covers is named in the merge itself: a `develop` that moved since is refused by GitHub
    // Rather than released on a verdict that never covered it
    expect(getPrCalls("merge")).toStrictEqual([
      [["pr", "merge", pullRequest.toString(), "--merge", "--admin", "--match-head-commit", developSha]],
    ]);
    expect(readSha(`origin/${DEVELOP_BRANCH}`)).toBe(developSha);
  });

  // What lands on main after the window went out — a repair, an express cut — can conflict with the release, and a
  // Merge GitHub cannot create fails every run: main is folded into develop instead, and the new head is reviewed
  test("folds a main the clean release conflicts with into develop rather than merging", async () => {
    expect.hasAssertions();

    const baseSha = commitFile(TEST_FILENAME, "");
    const mainSha = publish(MAIN_BRANCH, commitFile(TEST_FILENAME, " "));
    switchTo(baseSha);
    const developSha = publish(DEVELOP_BRANCH, deleteFile(TEST_FILENAME));
    publish(QUEUE_BRANCH, developSha);
    answerGh([{ number: pullRequest, state: ReleasePullRequestState.Open }], [], [getCleanWalkthrough(developSha)]);
    runDrainStep.mockResolvedValue({ isClean: true, reviewFixesSha: undefined } satisfies DrainStepResult);
    runSession.mockImplementation(() => {
      writeFileSync(join(getCwd(), TEST_FILENAME), " ");
      runGit(["add", TEST_FILENAME], getCwd());
      runGit(["commit", "--quiet", "--no-edit"], getCwd());
      return Promise.resolve({ isEnded: true, isStarted: true });
    });
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });
    const foldedSha = readSha(`origin/${DEVELOP_BRANCH}`);

    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Pushed,
      reason: `${MAIN_BRANCH} folded into ${DEVELOP_BRANCH} — the release conflicted with it, and merges once the new head is reviewed`,
      targetSha: foldedSha,
    });
    expect(runGit(["rev-list", "--parents", "--max-count=1", foldedSha], getCwd()).trim()).toBe(
      `${foldedSha} ${developSha} ${mainSha}`,
    );
    expect(getPrCalls("merge")).toHaveLength(0);
  });

  // A main that moved but still merges cleanly is GitHub's to merge: a fold would spend a review on nothing
  test("merges a clean release over a main it diverged from without conflict", async () => {
    expect.hasAssertions();

    const baseSha = readSha("HEAD");
    publish(MAIN_BRANCH, commitFile(TEST_FILENAME, ""));
    switchTo(baseSha);
    const developSha = publish(DEVELOP_BRANCH, commitFile(`${TEST_FILENAME}.ts`, ""));
    publish(QUEUE_BRANCH, developSha);
    answerGh([{ number: pullRequest, state: ReleasePullRequestState.Open }], [], [getCleanWalkthrough(developSha)]);
    runDrainStep.mockResolvedValue({ isClean: true, reviewFixesSha: undefined } satisfies DrainStepResult);

    await expect(runCycle({ ...baseInput, cwd: getCwd() })).resolves.toStrictEqual({
      kind: CycleOutcomeKind.Merged,
      reason: `pull request #${pullRequest} merged — the push to ${MAIN_BRANCH} runs the return stroke`,
    });
    expect(readSha(`origin/${DEVELOP_BRANCH}`)).toBe(developSha);
  });

  // A clean review the bot rates above the least risk is judged once per head: a hold ports on, a merge releases
  test("ports on when the verdict on a clean review above the least risk holds", async () => {
    expect.hasAssertions();

    const developSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    const queueSha = publish(QUEUE_BRANCH, commitFile(TEST_FILENAME, ""));
    answerGh(
      [{ number: pullRequest, state: ReleasePullRequestState.Open }],
      [],
      [getCleanWalkthrough(developSha, TEST_FILENAME)],
    );
    runDrainStep.mockResolvedValue({ isClean: true, reviewFixesSha: undefined } satisfies DrainStepResult);
    judgeRelease.mockResolvedValue(undefined);
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });

    expect(judgeRelease).toHaveBeenCalledTimes(1);
    expect(judgeRelease.mock.calls[0]?.[0]).toStrictEqual({
      cwd: getCwd(),
      developSha,
      isDryRun: false,
      issueComments: [getCleanWalkthrough(developSha, TEST_FILENAME)],
      level: TEST_FILENAME,
      pullRequest,
      reviews: [],
      unreviewedFromSha: undefined,
      viewerLogin,
    });
    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Pushed,
      reason: `1 queue commits and 0 fix commits reached ${DEVELOP_BRANCH}`,
      retriggerDelaySeconds: undefined,
      targetSha: queueSha,
    });
    expect(getPrCalls("merge")).toHaveLength(0);
  });

  // The bot writes that block on some releases and not others, so a head it states no level for is judged too:
  // Waiting for a block nobody promised holds a clean release forever, under a line that reads as healthy
  test("judges the release when the walkthrough states no merge risk for the head", async () => {
    expect.hasAssertions();

    const developSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    publish(QUEUE_BRANCH, commitFile(TEST_FILENAME, ""));
    answerGh([{ number: pullRequest, state: ReleasePullRequestState.Open }], [], [getCleanWalkthrough(developSha, "")]);
    runDrainStep.mockResolvedValue({ isClean: true, reviewFixesSha: undefined } satisfies DrainStepResult);
    const merged = { kind: CycleOutcomeKind.Merged, reason: TEST_FILENAME };
    judgeRelease.mockResolvedValue(merged);

    await expect(runCycle({ ...baseInput, cwd: getCwd() })).resolves.toStrictEqual(merged);
    // Judged on no level, and never merged unasked on one nobody gave
    expect(judgeRelease.mock.calls[0]?.[0].level).toBeUndefined();
    expect(getPrCalls("merge")).toHaveLength(0);
  });

  test("ends the run on the verdict's merge", async () => {
    expect.hasAssertions();

    const developSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    publish(QUEUE_BRANCH, commitFile(TEST_FILENAME, ""));
    answerGh(
      [{ number: pullRequest, state: ReleasePullRequestState.Open }],
      [],
      [getCleanWalkthrough(developSha, TEST_FILENAME)],
    );
    runDrainStep.mockResolvedValue({ isClean: true, reviewFixesSha: undefined } satisfies DrainStepResult);
    const merged = { kind: CycleOutcomeKind.Merged, reason: TEST_FILENAME };
    judgeRelease.mockResolvedValue(merged);

    await expect(runCycle({ ...baseInput, cwd: getCwd() })).resolves.toStrictEqual(merged);
    expect(readSha(`origin/${DEVELOP_BRANCH}`)).toBe(developSha);
  });
});
