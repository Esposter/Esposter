import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";
import type { GitHubReview } from "#src/models/coderabbit/shared/GitHubReview";
import type { runSession as baseRunSession } from "#src/services/coderabbit/collect/runSession";
import type { readUnresolvedThreads as baseReadUnresolvedThreads } from "#src/services/coderabbit/feedback/readUnresolvedThreads";
import type { runGh as baseRunGh } from "#src/services/coderabbit/shared/runGh";

import { CycleOutcomeKind } from "#src/models/coderabbit/collect/CycleOutcomeKind";
import { ReleaseVerdict } from "#src/models/coderabbit/collect/ReleaseVerdict";
import { DEVELOP_BRANCH, MAIN_BRANCH, VERDICT_MARKER } from "#src/services/coderabbit/collect/constants";
import { FIXTURE_TEST_TIMEOUT_MS, TEST_FILENAME } from "#src/services/coderabbit/collect/constants.test";
import { getMarker } from "#src/services/coderabbit/collect/getMarker";
import { judgeRelease } from "#src/services/coderabbit/collect/judgeRelease";
import { setupFixtureRepository } from "#src/services/coderabbit/collect/setupFixtureRepository.test";
import { CODERABBIT_REST_LOGIN } from "#src/services/coderabbit/shared/constants";
import { existsSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { assert, beforeEach, describe, expect, test, vi } from "vitest";

const { readUnresolvedThreads, runSession, runGh } = vi.hoisted(() => ({
  readUnresolvedThreads: vi.fn<typeof baseReadUnresolvedThreads>(),
  runSession: vi.fn<typeof baseRunSession>(),
  runGh: vi.fn<typeof baseRunGh>(),
}));

// The session, the thread read and `gh` are the three seams; git runs for real against the fixture
vi.mock(import("#src/services/coderabbit/collect/runSession"), () => ({
  runSession: runSession as unknown as typeof baseRunSession,
}));

vi.mock(import("#src/services/coderabbit/feedback/readUnresolvedThreads"), () => ({
  readUnresolvedThreads: readUnresolvedThreads as unknown as typeof baseReadUnresolvedThreads,
}));

vi.mock(import("#src/services/coderabbit/shared/runGh"), () => ({ runGh: runGh as unknown as typeof baseRunGh }));

const getComment = (login: string, body: string): GitHubEntry => ({ body, id: 0, updated_at: "", user: { login } });

describe(judgeRelease, { timeout: FIXTURE_TEST_TIMEOUT_MS }, () => {
  const { commitFile, getCwd, publish, readSha } = setupFixtureRepository();
  const pullRequest = 0;
  const viewerLogin = "viewerLogin";
  const level = TEST_FILENAME;
  const review: GitHubReview = {
    body: "**Actionable comments posted: 0**",
    commit_id: "",
    id: 0,
    submitted_at: "",
    updated_at: "",
    user: { login: CODERABBIT_REST_LOGIN },
  };
  const getMergeCalls = () => runGh.mock.calls.filter(([args]) => args[0] === "pr" && args[1] === "merge");
  const getCommentCalls = () => runGh.mock.calls.filter(([args]) => args[0] === "pr" && args[1] === "comment");
  // The one line the session writes, at the path the prompt names
  const VERDICT_PATH_REGEX = /Write exactly one line to `(?<path>[^`]+)`/u;
  const answerWith = (line: string | undefined) => {
    runSession.mockImplementation(({ prompt }) => {
      const path = VERDICT_PATH_REGEX.exec(prompt)?.groups?.path;
      if (line !== undefined && path) writeFileSync(path, line);
      return Promise.resolve({ isEnded: true, isStarted: true });
    });
  };
  beforeEach(() => {
    readUnresolvedThreads.mockReturnValue([]);
  });

  const getInput = (developSha: string, issueComments: GitHubEntry[] = []) => ({
    cwd: getCwd(),
    developSha,
    isDryRun: false,
    issueComments,
    level,
    pullRequest,
    reviews: [review],
    viewerLogin,
  });

  test("merges on a merge verdict and records it on the pull request", async () => {
    expect.hasAssertions();

    const developSha = publish(DEVELOP_BRANCH, commitFile(TEST_FILENAME, ""));
    answerWith(`${ReleaseVerdict.Merge} — the rationale restates answered rounds`);
    const outcome = await judgeRelease(getInput(developSha));

    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Merged,
      reason: `pull request #${pullRequest} merged — the push to ${MAIN_BRANCH} runs the return stroke`,
    });
    expect(runSession).toHaveBeenCalledTimes(1);
    expect(runSession.mock.calls[0]?.[0].prompt).toContain(`\`${DEVELOP_BRANCH}\` at ${developSha}`);
    expect(readSha("HEAD")).toBe(developSha);
    expect(getCommentCalls()).toStrictEqual([
      [
        [
          "pr",
          "comment",
          pullRequest.toString(),
          "--body",
          expect.stringContaining(
            `${getMarker(VERDICT_MARKER, developSha)} ${ReleaseVerdict.Merge} — the rationale restates answered rounds`,
          ),
        ],
      ],
    ]);
    expect(getMergeCalls()).toHaveLength(1);
  });

  test("ports on with a hold verdict recorded", async () => {
    expect.hasAssertions();

    const developSha = publish(DEVELOP_BRANCH, commitFile(TEST_FILENAME, ""));
    answerWith(`${ReleaseVerdict.Hold} the bench rewrites a tracked ledger`);

    await expect(judgeRelease(getInput(developSha))).resolves.toBeUndefined();
    expect(getCommentCalls()[0]?.[0].at(-1)).toContain(
      `${getMarker(VERDICT_MARKER, developSha)} ${ReleaseVerdict.Hold} — the bench rewrites a tracked ledger`,
    );
    expect(getMergeCalls()).toHaveLength(0);
  });

  // A release is never made on a reading nobody reached, and the head is not judged twice
  test("holds when the session writes no verdict", async () => {
    expect.hasAssertions();

    const developSha = publish(DEVELOP_BRANCH, commitFile(TEST_FILENAME, ""));
    answerWith(undefined);

    await expect(judgeRelease(getInput(developSha))).resolves.toBeUndefined();
    expect(getCommentCalls()[0]?.[0].at(-1)).toContain(`${ReleaseVerdict.Hold} — the session gave no verdict`);
  });

  test.each([
    [ReleaseVerdict.Merge, 1],
    [ReleaseVerdict.Hold, 0],
  ])("re-applies a recorded %s verdict without a session", async (verdict, mergeCallCount) => {
    expect.hasAssertions();

    const developSha = publish(DEVELOP_BRANCH, commitFile(TEST_FILENAME, ""));
    const recorded = getComment(
      viewerLogin,
      `${getMarker(VERDICT_MARKER, developSha)} ${verdict} — recorded\nThe review…`,
    );
    await judgeRelease(getInput(developSha, [recorded]));

    expect(runSession).not.toHaveBeenCalled();
    expect(getCommentCalls()).toHaveLength(0);
    expect(getMergeCalls()).toHaveLength(mergeCallCount);
  });

  // The session holds no credential, so its verdict leaves as a file — and a directory per head judged is a
  // Directory per head left behind
  test("removes the directory it gave the session to write the verdict to", async () => {
    expect.hasAssertions();

    const developSha = publish(DEVELOP_BRANCH, commitFile(TEST_FILENAME, ""));
    answerWith(`${ReleaseVerdict.Hold} the bench rewrites a tracked ledger`);
    await judgeRelease(getInput(developSha));

    const verdictPath = VERDICT_PATH_REGEX.exec(runSession.mock.calls[0]?.[0].prompt ?? "")?.groups?.path;
    assert.exists(verdictPath);
    expect(existsSync(dirname(verdictPath))).toBe(false);
  });

  test("runs no session on a dry run", async () => {
    expect.hasAssertions();

    const developSha = publish(DEVELOP_BRANCH, commitFile(TEST_FILENAME, ""));

    await expect(judgeRelease({ ...getInput(developSha), isDryRun: true })).resolves.toBeUndefined();
    expect(runSession).not.toHaveBeenCalled();
    expect(runGh).not.toHaveBeenCalled();
  });
});
