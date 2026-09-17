import type { CheckStatus } from "#src/models/coderabbit/collect/CheckStatus";
import type { DrainStepResult } from "#src/models/coderabbit/collect/DrainStepResult";
import type { MainCheck } from "#src/models/coderabbit/collect/MainCheck";
import type { ReleasePullRequest } from "#src/models/coderabbit/collect/ReleasePullRequest";
import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";
import type { GitHubReview } from "#src/models/coderabbit/shared/GitHubReview";
import type { judgeRelease as baseJudgeRelease } from "#src/services/coderabbit/collect/judgeRelease";
import type { readCheckStatus as baseReadCheckStatus } from "#src/services/coderabbit/collect/readCheckStatus";
import type { runDrain as baseRunDrain } from "#src/services/coderabbit/collect/runDrain";
import type { runDrainStep as baseRunDrainStep } from "#src/services/coderabbit/collect/runDrainStep";
import type { spawnPnpm as baseSpawnPnpm } from "#src/services/coderabbit/collect/spawnPnpm";
import type { runGh as baseRunGh } from "#src/services/coderabbit/shared/runGh";
import type { SpawnSyncReturns } from "node:child_process";

import { CycleOutcomeKind } from "#src/models/coderabbit/collect/CycleOutcomeKind";
import { ReleasePullRequestState } from "#src/models/coderabbit/collect/ReleasePullRequestState";
import {
  CHECK_NAME,
  CI_FAILURE_CONCLUSION,
  COMPLETED_DESCRIPTION,
  DEVELOP_BRANCH,
  DRAIN_ATTEMPT_CAP,
  EXPRESS_TRAILER,
  HELD_MARKER,
  INSTALL_COMMAND,
  MAIN_BRANCH,
  MERGEABLE_RISK_LEVEL,
  PASS_BUCKET,
  PENDING_BUCKET,
  QUEUE_BRANCH,
  RECENT_REVIEW_MARKER,
  REPAIR_FAILED_MARKER,
  REPAIRS_TRAILER,
  RESHAPE_FAILED_MARKER,
} from "#src/services/coderabbit/collect/constants";
import { FIXTURE_TEST_TIMEOUT_MS, TEST_FILENAME } from "#src/services/coderabbit/collect/constants.test";
import { getMarker } from "#src/services/coderabbit/collect/getMarker";
import { runCycle } from "#src/services/coderabbit/collect/runCycle";
import { setupFixtureRepository } from "#src/services/coderabbit/collect/setupFixtureRepository.test";
import { CODERABBIT_REST_LOGIN, REVIEW_FILE_CAP } from "#src/services/coderabbit/shared/constants";
import { runGit } from "#src/services/coderabbit/shared/runGit";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { judgeRelease, readCheckStatus, runDrain, runDrainStep, runGh, spawnPnpm } = vi.hoisted(() => ({
  judgeRelease: vi.fn<typeof baseJudgeRelease>(),
  readCheckStatus: vi.fn<typeof baseReadCheckStatus>(),
  runDrain: vi.fn<typeof baseRunDrain>(),
  runDrainStep: vi.fn<typeof baseRunDrainStep>(),
  runGh: vi.fn<typeof baseRunGh>(),
  spawnPnpm: vi.fn<typeof baseSpawnPnpm>(),
}));

// The seams the pass cannot reach from a fixture repository: `gh`, the check status it reads through
// `gh pr checks`, the steps that spawn Claude — the drain, the release verdict and the repairer's session — and
// The `pnpm` the express lane verifies a cut with. Git runs for real.
vi.mock(import("#src/services/coderabbit/shared/runGh"), () => ({ runGh: runGh as unknown as typeof baseRunGh }));

vi.mock(import("#src/services/coderabbit/collect/runDrain"), () => ({
  runDrain: runDrain as unknown as typeof baseRunDrain,
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
// And the merge risk it states for the head it read — the least unless a test says otherwise
const getCleanWalkthrough = (sha: string, level = MERGEABLE_RISK_LEVEL): GitHubEntry => ({
  body: `<!-- ${RECENT_REVIEW_MARKER}_start -->between ${sha} and ${sha}<!-- ${RECENT_REVIEW_MARKER}_end -->\n**Merge Risk:** _${TEST_FILENAME} ${level}_\n<!-- final_review_risk_coverage:{"sourceCommitId":"${sha}","coveredCommitId":"${sha}","kind":"reviewed"} -->`,
  id: 0,
  updated_at: "",
  user: { login: CODERABBIT_REST_LOGIN },
});

describe(runCycle, { timeout: FIXTURE_TEST_TIMEOUT_MS }, () => {
  const { commitFile, commitFiles, getCwd, installPreReceiveHook, publish, readSha, switchTo } =
    setupFixtureRepository();
  const pullRequest = 0;
  const viewerLogin = "viewerLogin";
  // The fixture's shas are deterministic, so a post one test made to main's head would read as another's
  beforeEach(() => {
    vi.clearAllMocks();
  });
  const completedCheck: CheckStatus = { bucket: PASS_BUCKET, description: COMPLETED_DESCRIPTION, name: CHECK_NAME };
  const overflowPaths = Array.from({ length: REVIEW_FILE_CAP + 1 }, (_value, index) => `${TEST_FILENAME}/${index}`);
  // CI's verdict on main's head, red when a test says so, and what every `pnpm` the lane spawns answers
  const redRun: MainCheck = { conclusion: CI_FAILURE_CONCLUSION, databaseId: 0, status: "completed", url: "" };
  const greenSpawn: SpawnSyncReturns<string> = { output: [], pid: 0, signal: null, status: 0, stderr: "", stdout: "" };
  // What `gh` answers: the login, the release pull request list, the reviews, the issue comments, every commit's
  // Comments, CI's runs for main's head, a red run's log, and `[[]]` for every other paginated list — the one
  // Page of nothing a `--slurp` returns
  const baseInput = { isDryRun: false, isForced: false };
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
  const getPrCalls = (subcommand: string) =>
    runGh.mock.calls.filter(([args]) => args[0] === "pr" && args[1] === subcommand);
  const getCommitCommentPosts = (sha: string) =>
    runGh.mock.calls.filter(([args]) => args[1] === `repos/{owner}/{repo}/commits/${sha}/comments` && args[2] === "-f");
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
  // Every check red, the install alone green — a repair needs the tree installed before the session runs
  const answerRedChecks = () => {
    spawnPnpm.mockImplementation((args) =>
      args.join(" ") === INSTALL_COMMAND.join(" ") ? greenSpawn : { ...greenSpawn, status: 1 },
    );
  };

  // A red main with nothing claimed is the repairer's: the session commits at the head, the cut is verified and
  // Pushed, and the run ends on the push
  test("repairs a red main and ends the run on its push", async () => {
    expect.hasAssertions();

    const mainSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    publish(QUEUE_BRANCH, mainSha);
    answerGh([], [], [], [], [redRun]);
    spawnPnpm.mockReturnValue(greenSpawn);
    runDrain.mockImplementation(() => {
      commitFile(`${TEST_FILENAME}.ts`, "");
      runGit(["commit", "--quiet", "--amend", "--no-edit", "--trailer", `${REPAIRS_TRAILER}: ${mainSha}`], getCwd());
      return Promise.resolve({ isDrained: true, isStarted: true });
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

  // The cut goes first even over a red main: a claimed commit may be the repair, and it reaches main this way alone
  test("cuts a claimed commit whose cut is green over a red main, without a session", async () => {
    expect.hasAssertions();

    publish(DEVELOP_BRANCH, MAIN_BRANCH);
    commitFile(TEST_FILENAME, "");
    publish(QUEUE_BRANCH, claimExpress());
    answerGh([], [], [], [], [redRun]);
    spawnPnpm.mockReturnValue(greenSpawn);
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });

    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Expressed,
      reason: `1 express commits reached ${MAIN_BRANCH}`,
      targetSha: readSha(`origin/${MAIN_BRANCH}`),
    });
    expect(runDrain).not.toHaveBeenCalled();
  });

  // The session's word proves nothing: a repair that is not a trailered commit over a clean tree counts the
  // Attempt on main's head and fails the run, as the fold does
  test("counts a repair that left no trailered commit on main's head and fails the run", async () => {
    expect.hasAssertions();

    const mainSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    publish(QUEUE_BRANCH, mainSha);
    answerGh([], [], [], [], [redRun]);
    spawnPnpm.mockReturnValue(greenSpawn);
    runDrain.mockImplementation(() => {
      commitFile(TEST_FILENAME, "");
      return Promise.resolve({ isDrained: true, isStarted: true });
    });

    await expect(runCycle({ ...baseInput, cwd: getCwd() })).rejects.toThrowError(
      `the repairer left ${mainSha} unrepaired (attempt 1 of ${DRAIN_ATTEMPT_CAP})`,
    );
    expect(readSha(`origin/${MAIN_BRANCH}`)).toBe(mainSha);
    expect(getCommitCommentPosts(mainSha)).toStrictEqual([
      [
        [
          "api",
          `repos/{owner}/{repo}/commits/${mainSha}/comments`,
          "-f",
          `body=${getMarker(REPAIR_FAILED_MARKER, mainSha)}\nRepair attempt 1 of this red ${MAIN_BRANCH} head failed — see the collector run.`,
        ],
      ],
    ]);
  });

  // A red cut over a red main under repair is the red of neither: the claimed commit waits, told nothing — here
  // Behind a repairer that could not start
  test("holds a claimed commit whose cut is red while a red main is under repair, unsaid", async () => {
    expect.hasAssertions();

    publish(DEVELOP_BRANCH, MAIN_BRANCH);
    commitFile(TEST_FILENAME, "");
    publish(QUEUE_BRANCH, claimExpress());
    answerGh([], [], [], [], [redRun]);
    answerRedChecks();
    runDrain.mockResolvedValue({ isDrained: false, isStarted: false });
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });

    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Idle,
      reason: `1 claimed commits wait on the express lane — a red cut, a patch that does not apply yet, or a red ${MAIN_BRANCH} under repair`,
      retriggerDelaySeconds: undefined,
      targetSha: undefined,
    });
    expect(runGh.mock.calls.filter(([args]) => args[2] === "-f")).toHaveLength(0);
  });

  // Past its repairs a red main is a person's, said once on the head, and a red cut is the claimed commit's own
  test("tells a claimed commit its cut is red once a red main is past its repairs", async () => {
    expect.hasAssertions();

    const mainSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    commitFile(TEST_FILENAME, "");
    const claimedSha = publish(QUEUE_BRANCH, claimExpress());
    answerGh(
      [],
      [],
      [],
      Array.from({ length: DRAIN_ATTEMPT_CAP }, (_, id) => ({
        ...getMarked(getMarker(REPAIR_FAILED_MARKER, mainSha)),
        id,
      })),
      [redRun],
    );
    answerRedChecks();
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });

    expect(outcome.kind).toBe(CycleOutcomeKind.Idle);
    expect(runDrain).not.toHaveBeenCalled();
    expect(getCommitCommentPosts(mainSha)).toHaveLength(1);
    expect(getCommitCommentPosts(claimedSha)).toHaveLength(1);
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
    Array.from({ length: DRAIN_ATTEMPT_CAP }, (_, id) => ({ ...getMarked(getMarker(RESHAPE_FAILED_MARKER, sha)), id }));

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
    expect(judgeRelease.mock.calls[0]?.[0]).toMatchObject({ developSha, level: TEST_FILENAME, pullRequest });
    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Pushed,
      reason: `1 queue commits and 0 fix commits reached ${DEVELOP_BRANCH}`,
      retriggerDelaySeconds: undefined,
      targetSha: queueSha,
    });
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
