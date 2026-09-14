import type { CheckStatus } from "#src/models/coderabbit/collect/CheckStatus";
import type { DrainStepResult } from "#src/models/coderabbit/collect/DrainStepResult";
import type { ReleasePullRequest } from "#src/models/coderabbit/collect/ReleasePullRequest";
import type { GitHubReview } from "#src/models/coderabbit/shared/GitHubReview";
import type { readCheckStatus as baseReadCheckStatus } from "#src/services/coderabbit/collect/readCheckStatus";
import type { runDrainStep as baseRunDrainStep } from "#src/services/coderabbit/collect/runDrainStep";
import type { runGh as baseRunGh } from "#src/services/coderabbit/shared/runGh";

import { CycleOutcomeKind } from "#src/models/coderabbit/collect/CycleOutcomeKind";
import { ReleasePullRequestState } from "#src/models/coderabbit/collect/ReleasePullRequestState";
import {
  CHECK_NAME,
  COMPLETED_DESCRIPTION,
  DEVELOP_BRANCH,
  MAIN_BRANCH,
  PASS_BUCKET,
  PENDING_BUCKET,
  QUEUE_BRANCH,
} from "#src/services/coderabbit/collect/constants";
import { FIXTURE_TEST_TIMEOUT_MS, TEST_FILENAME } from "#src/services/coderabbit/collect/constants.test";
import { runCycle } from "#src/services/coderabbit/collect/runCycle";
import { setupFixtureRepository } from "#src/services/coderabbit/collect/setupFixtureRepository.test";
import { CODERABBIT_REST_LOGIN, REVIEW_FILE_CAP, WINDOW_FILL_TARGET } from "#src/services/coderabbit/shared/constants";
import { describe, expect, test, vi } from "vitest";

const { readCheckStatus, runDrainStep, runGh } = vi.hoisted(() => ({
  readCheckStatus: vi.fn<typeof baseReadCheckStatus>(),
  runDrainStep: vi.fn<typeof baseRunDrainStep>(),
  runGh: vi.fn<typeof baseRunGh>(),
}));

// The three seams the pass cannot reach from a fixture repository: `gh`, the check status it reads through
// `gh pr checks`, and the drain that spawns Claude. Git runs for real against the fixture.
vi.mock(import("#src/services/coderabbit/shared/runGh"), () => ({ runGh: runGh as unknown as typeof baseRunGh }));

vi.mock(import("#src/services/coderabbit/collect/readCheckStatus"), () => ({
  readCheckStatus: readCheckStatus as unknown as typeof baseReadCheckStatus,
}));

vi.mock(import("#src/services/coderabbit/collect/runDrainStep"), () => ({
  runDrainStep: runDrainStep as unknown as typeof baseRunDrainStep,
}));

describe(runCycle, { timeout: FIXTURE_TEST_TIMEOUT_MS }, () => {
  const { commitFile, commitFiles, getCwd, installPreReceiveHook, publish, readSha, switchTo } =
    setupFixtureRepository();
  const pullRequest = 0;
  const viewerLogin = "viewerLogin";
  const completedCheck: CheckStatus = { bucket: PASS_BUCKET, description: COMPLETED_DESCRIPTION, name: CHECK_NAME };
  const fillPaths = Array.from({ length: WINDOW_FILL_TARGET }, (_, index) => `${TEST_FILENAME}/${index}`);
  const overflowPaths = Array.from({ length: REVIEW_FILE_CAP + 1 }, (_, index) => `${TEST_FILENAME}/${index}`);
  // What `gh` answers: the login, the release pull request list, the reviews, and `[[]]` for every paginated
  // Comment list — the one page of nothing a `--slurp` returns
  const baseInput = { isDryRun: false, isForced: false };
  const answerGh = (releasePullRequests: ReleasePullRequest[], reviews: GitHubReview[] = []) => {
    runGh.mockImplementation((args) => {
      if (args[1] === "user") return viewerLogin;
      else if (args[0] === "pr" && args[1] === "list") return JSON.stringify(releasePullRequests);
      else if (args[1]?.startsWith(`repos/{owner}/{repo}/pulls/${pullRequest}/reviews`))
        return JSON.stringify([reviews]);
      return "[[]]";
    });
  };
  const getPrCreateCalls = () => runGh.mock.calls.filter(([args]) => args[0] === "pr" && args[1] === "create");

  test("fast-forwards develop onto a merged main before measuring anything", async () => {
    expect.hasAssertions();

    const developSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    publish(QUEUE_BRANCH, developSha);
    const mainSha = publish(MAIN_BRANCH, commitFile(TEST_FILENAME, ""));
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });

    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.FastForwarded,
      reason: `${DEVELOP_BRANCH} followed ${MAIN_BRANCH} — the next event measures against it`,
      targetSha: mainSha,
    });
    expect(readSha(`origin/${DEVELOP_BRANCH}`)).toBe(mainSha);
    expect(runGh).not.toHaveBeenCalled();
  });

  test("waits while the queue is under the fill target", async () => {
    expect.hasAssertions();

    const developSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    publish(QUEUE_BRANCH, commitFile(TEST_FILENAME, ""));
    answerGh([]);
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });

    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Idle,
      reason: "waiting — the queue is under the fill target",
      retriggerDelaySeconds: undefined,
      targetSha: undefined,
    });
    expect(readSha(`origin/${DEVELOP_BRANCH}`)).toBe(developSha);
    expect(getPrCreateCalls()).toHaveLength(0);
  });

  // The queue sits on develop's head, so the window is a fast-forward to the queue's own sha
  test("pushes a queue at the fill target and opens the release pull request over it", async () => {
    expect.hasAssertions();

    publish(DEVELOP_BRANCH, MAIN_BRANCH);
    const queueSha = publish(QUEUE_BRANCH, commitFiles(fillPaths, ""));
    answerGh([]);
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });

    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Opened,
      reason: `the release: ${DEVELOP_BRANCH} → ${MAIN_BRANCH} pull request is open — its first review reads the whole window`,
      targetSha: queueSha,
    });
    expect(readSha(`origin/${DEVELOP_BRANCH}`)).toBe(queueSha);
    expect(getPrCreateCalls()).toHaveLength(1);
  });

  // The last release merged and develop already carries the next window: nothing to port, only the pull request owed
  test("opens the release pull request over a develop that already carries the window", async () => {
    expect.hasAssertions();

    const developSha = publish(DEVELOP_BRANCH, commitFiles(fillPaths, ""));
    publish(QUEUE_BRANCH, developSha);
    answerGh([]);
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });

    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Opened,
      reason: `the release: ${DEVELOP_BRANCH} → ${MAIN_BRANCH} pull request is open — its first review reads the whole window`,
      targetSha: developSha,
    });
    expect(readSha(`origin/${DEVELOP_BRANCH}`)).toBe(developSha);
    expect(getPrCreateCalls()).toHaveLength(1);
  });

  test("reports the push it would make on a dry run and moves nothing", async () => {
    expect.hasAssertions();

    const developSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    publish(QUEUE_BRANCH, commitFiles(fillPaths, ""));
    answerGh([]);
    const outcome = await runCycle({ ...baseInput, cwd: getCwd(), isDryRun: true });

    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Pushed,
      reason: `would fold ${MAIN_BRANCH} in and push the window to ${DEVELOP_BRANCH}, then open the release pull request`,
      retriggerDelaySeconds: undefined,
      targetSha: undefined,
    });
    expect(readSha(`origin/${DEVELOP_BRANCH}`)).toBe(developSha);
    expect(getPrCreateCalls()).toHaveLength(0);
  });

  // A first commit over the cap can never fit, so the window is held rather than reported as under-filled
  test("holds a queue whose first commit overflows the cap", async () => {
    expect.hasAssertions();

    const developSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    publish(QUEUE_BRANCH, commitFiles(overflowPaths, ""));
    answerGh([]);
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });

    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Idle,
      reason: "held — no owed commit fits this window",
      retriggerDelaySeconds: undefined,
      targetSha: undefined,
    });
    expect(readSha(`origin/${DEVELOP_BRANCH}`)).toBe(developSha);
  });

  test("opens nothing over a release pull request a person closed", async () => {
    expect.hasAssertions();

    publish(DEVELOP_BRANCH, MAIN_BRANCH);
    publish(QUEUE_BRANCH, commitFiles(fillPaths, ""));
    answerGh([{ number: pullRequest, state: ReleasePullRequestState.Closed }]);
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });

    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Idle,
      reason: `pull request #${pullRequest} was closed without merging — a person's pause, re-open it to resume`,
      retriggerDelaySeconds: undefined,
      targetSha: undefined,
    });
    expect(getPrCreateCalls()).toHaveLength(0);
  });

  test("exits at the gate while a review is running", async () => {
    expect.hasAssertions();

    const developSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    publish(QUEUE_BRANCH, commitFiles(fillPaths, ""));
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
    publish(QUEUE_BRANCH, commitFiles(fillPaths, ""));
    answerGh([{ number: pullRequest, state: ReleasePullRequestState.Open }]);
    readCheckStatus.mockReturnValue(undefined);

    await expect(runCycle({ ...baseInput, cwd: getCwd() })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: coderabbit, no CodeRabbit check on the pull request]`,
    );
  });

  // The reviewed frontier is read off the review body; a body ending at develop's head is a free slot
  test("drains, ports the queue behind the fixes and reports the window it pushed", async () => {
    expect.hasAssertions();

    const developSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    const queueSha = publish(QUEUE_BRANCH, commitFiles(fillPaths, ""));
    answerGh(
      [{ number: pullRequest, state: ReleasePullRequestState.Open }],
      [
        {
          body: `between ${developSha} and ${developSha}`,
          commit_id: developSha,
          id: 0,
          submitted_at: "",
          updated_at: "",
          user: { login: CODERABBIT_REST_LOGIN },
        },
      ],
    );
    readCheckStatus.mockReturnValue(completedCheck);
    runDrainStep.mockResolvedValue({ reviewFixesSha: undefined } satisfies DrainStepResult);
    const outcome = await runCycle({ ...baseInput, cwd: getCwd() });

    expect(runDrainStep).toHaveBeenCalledTimes(1);
    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Pushed,
      reason: `1 queue commits and 0 fix commits reached ${DEVELOP_BRANCH}`,
      retriggerDelaySeconds: undefined,
      targetSha: queueSha,
    });
    expect(readSha(`origin/${DEVELOP_BRANCH}`)).toBe(queueSha);
  });

  // The lease is the compare-and-swap: a develop that moved under the run is refused and reported, never overwritten
  test("reports a develop that moved during the run and pushes nothing over it", async () => {
    expect.hasAssertions();

    const developSha = publish(DEVELOP_BRANCH, MAIN_BRANCH);
    publish(QUEUE_BRANCH, commitFiles(fillPaths, ""));
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
    expect(getPrCreateCalls()).toHaveLength(0);
  });
});
