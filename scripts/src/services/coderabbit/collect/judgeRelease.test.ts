import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";
import type { GitHubReview } from "#src/models/coderabbit/shared/GitHubReview";
import type { readReleaseGate as baseReadReleaseGate } from "#src/services/coderabbit/collect/readReleaseGate";
import type { runSession as baseRunSession } from "#src/services/coderabbit/collect/runSession";
import type { readUnresolvedThreads as baseReadUnresolvedThreads } from "#src/services/coderabbit/feedback/readUnresolvedThreads";
import type { runGh as baseRunGh } from "#src/services/shared/runGh";

import { CycleOutcomeKind } from "#src/models/coderabbit/collect/CycleOutcomeKind";
import { ReleaseVerdict } from "#src/models/coderabbit/collect/ReleaseVerdict";
import {
  DEVELOP_BRANCH,
  DRAIN_LIMITED_MARKER,
  MAIN_BRANCH,
  VERDICT_MARKER,
} from "#src/services/coderabbit/collect/constants";
import { FIXTURE_TEST_TIMEOUT_MS, TEST_FILENAME } from "#src/services/coderabbit/collect/constants.test";
import { getMarker } from "#src/services/coderabbit/collect/getMarker";
import { judgeRelease } from "#src/services/coderabbit/collect/judgeRelease";
import { setupFixtureRepository } from "#src/services/coderabbit/collect/setupFixtureRepository.test";
import { ASSESSMENT_MARKER, RISK_MARKER } from "#src/services/coderabbit/feedback/constants";
import { CODERABBIT_REST_LOGIN } from "#src/services/coderabbit/shared/constants";
import { existsSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { assert, beforeEach, describe, expect, test, vi } from "vitest";

const { readReleaseGate, readUnresolvedThreads, runGh, runSession } = vi.hoisted(() => ({
  readReleaseGate: vi.fn<typeof baseReadReleaseGate>(),
  readUnresolvedThreads: vi.fn<typeof baseReadUnresolvedThreads>(),
  runGh: vi.fn<typeof baseRunGh>(),
  runSession: vi.fn<typeof baseRunSession>(),
}));

// The gate, the session, the thread read and `gh` are the seams; git runs for real against the fixture
vi.mock(import("#src/services/coderabbit/collect/runSession"), () => ({
  runSession: runSession as unknown as typeof baseRunSession,
}));

vi.mock(import("#src/services/coderabbit/collect/readReleaseGate"), () => ({
  readReleaseGate: readReleaseGate as unknown as typeof baseReadReleaseGate,
}));

vi.mock(import("#src/services/coderabbit/feedback/readUnresolvedThreads"), () => ({
  readUnresolvedThreads: readUnresolvedThreads as unknown as typeof baseReadUnresolvedThreads,
}));

vi.mock(import("#src/services/shared/runGh"), () => ({ runGh: runGh as unknown as typeof baseRunGh }));

const getComment = (login: string, body: string): GitHubEntry => ({ body, id: 0, updated_at: "", user: { login } });

const getBlock = (marker: string) => `<!-- ${marker}_start -->\n${marker}\n<!-- ${marker}_end -->`;

const getMergeCalls = () => runGh.mock.calls.filter(([args]) => args[0] === "pr" && args[1] === "merge");
const getCommentCalls = () => runGh.mock.calls.filter(([args]) => args[0] === "pr" && args[1] === "comment");

describe(judgeRelease, { timeout: FIXTURE_TEST_TIMEOUT_MS }, () => {
  const { commitFile, getCwd, publish, readSha } = setupFixtureRepository();
  const pullRequest = 0;
  const ONE_HOUR_MS: number = Temporal.Duration.from({ hours: 1 }).total("milliseconds");
  const viewerLogin = "viewerLogin";
  const level = TEST_FILENAME;
  // A walkthrough carrying both blocks the judge can be handed, each telling itself apart by its own marker
  const WALKTHROUGH = [getBlock(RISK_MARKER), getBlock(ASSESSMENT_MARKER)].join("\n");
  const review: GitHubReview = {
    body: "**Actionable comments posted: 0**",
    commit_id: "",
    id: 0,
    submitted_at: "",
    updated_at: "",
    user: { login: CODERABBIT_REST_LOGIN },
  };
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
    // The band, which is where every test but the gate's own reads the tree through a session
    readReleaseGate.mockResolvedValue(undefined);
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

  // The common head: the bot's risk level is sticky across rounds, so the rationale usually names only what the
  // Record already answers — and that reading needs no tree, so it costs no session at all
  test("merges on the gate's verdict without spawning a session", async () => {
    expect.hasAssertions();

    const developSha = publish(DEVELOP_BRANCH, commitFile(TEST_FILENAME, ""));
    const reason = "the rationale names nothing the pull request has not answered (jev 0.04)";
    readReleaseGate.mockResolvedValue({ reason, verdict: ReleaseVerdict.Merge });
    const outcome = await judgeRelease(getInput(developSha));

    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Merged,
      reason: `pull request #${pullRequest} merged — the push to ${MAIN_BRANCH} runs the return stroke`,
    });
    expect(runSession).not.toHaveBeenCalled();
    expect(getCommentCalls()[0]?.[0]?.[4]).toContain(
      `${getMarker(VERDICT_MARKER, developSha)} ${ReleaseVerdict.Merge} — ${reason}`,
    );
  });

  // A hold the gate reached is a hold a person meets, recorded exactly as the session's is: the next head is
  // Judged afresh either way, so nothing here is owed a session to confirm it
  test("holds on the gate's verdict without spawning a session", async () => {
    expect.hasAssertions();

    const developSha = publish(DEVELOP_BRANCH, commitFile(TEST_FILENAME, ""));
    const reason = "the rationale names a concern the pull request never answered (jev 0.96)";
    readReleaseGate.mockResolvedValue({ reason, verdict: ReleaseVerdict.Hold });
    const outcome = await judgeRelease(getInput(developSha));

    expect(outcome).toBeUndefined();
    expect(runSession).not.toHaveBeenCalled();
    expect(getMergeCalls()).toStrictEqual([]);
    expect(getCommentCalls()[0]?.[0]?.[4]).toContain(
      `${getMarker(VERDICT_MARKER, developSha)} ${ReleaseVerdict.Hold} — ${reason}`,
    );
  });

  // The account's limit holds every session, and the gate spends none of it — so a release the record already
  // Settles is not parked behind an outage that has nothing to do with it
  test("merges on the gate's verdict while the account is out of session", async () => {
    expect.hasAssertions();

    const developSha = publish(DEVELOP_BRANCH, commitFile(TEST_FILENAME, ""));
    const resetAt = new Date(Date.now() + ONE_HOUR_MS).toISOString();
    const limited = getComment(viewerLogin, `<!-- ${DRAIN_LIMITED_MARKER} until ${resetAt} -->`);
    readReleaseGate.mockResolvedValue({ reason: "nothing is left", verdict: ReleaseVerdict.Merge });
    const outcome = await judgeRelease(getInput(developSha, [limited]));

    expect(outcome).toStrictEqual({
      kind: CycleOutcomeKind.Merged,
      reason: `pull request #${pullRequest} merged — the push to ${MAIN_BRANCH} runs the return stroke`,
    });
    expect(runSession).not.toHaveBeenCalled();
  });

  // What the limit does still hold: the reading only a session can make
  test("waits out the account's limit when the gate cannot decide", async () => {
    expect.hasAssertions();

    const developSha = publish(DEVELOP_BRANCH, commitFile(TEST_FILENAME, ""));
    const resetAt = new Date(Date.now() + ONE_HOUR_MS).toISOString();
    const limited = getComment(viewerLogin, `<!-- ${DRAIN_LIMITED_MARKER} until ${resetAt} -->`);

    await expect(judgeRelease(getInput(developSha, [limited]))).resolves.toBeUndefined();
    expect(runSession).not.toHaveBeenCalled();
    expect(getCommentCalls()).toStrictEqual([]);
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

  // The bot writes its merge-risk block on some releases and not others, so a head it stated no level for is
  // Judged on the block it did write — never merged unasked on a level nobody gave, and never held for one. A
  // Block naming an older head leaves `level` undefined the same way, and it rates code the fixes have since
  // Changed, so the walkthrough carrying one is that same head and the rationale is left where it lies.
  test("judges a head the bot stated no merge risk for on its change assessment, never on a stale rationale", async () => {
    expect.hasAssertions();

    const developSha = publish(DEVELOP_BRANCH, commitFile(TEST_FILENAME, ""));
    answerWith(`${ReleaseVerdict.Merge} — nothing is left`);
    await judgeRelease({ ...getInput(developSha, [getComment(CODERABBIT_REST_LOGIN, WALKTHROUGH)]), level: undefined });

    const riskBlock = readReleaseGate.mock.calls[0]?.[0].riskBlock;
    expect(riskBlock).toContain(ASSESSMENT_MARKER);
    expect(riskBlock).not.toContain(RISK_MARKER);
    expect(runSession.mock.calls[0]?.[0].prompt).toContain(
      `## The bot's change assessment\n\n<!-- ${ASSESSMENT_MARKER}_start -->`,
    );
    expect(getCommentCalls()[0]?.[0].at(-1)).toContain("the bot stated no merge risk for it");
  });

  // The other half of the same rule: a level reached here only because the block covers this head, so that
  // Block is the rationale the question is asked over and the assessment is the one left out
  test("judges a head the bot stated a merge risk for on that rationale", async () => {
    expect.hasAssertions();

    const developSha = publish(DEVELOP_BRANCH, commitFile(TEST_FILENAME, ""));
    answerWith(`${ReleaseVerdict.Merge} — nothing is left`);
    await judgeRelease(getInput(developSha, [getComment(CODERABBIT_REST_LOGIN, WALKTHROUGH)]));

    const riskBlock = readReleaseGate.mock.calls[0]?.[0].riskBlock;
    expect(riskBlock).toContain(RISK_MARKER);
    expect(riskBlock).not.toContain(ASSESSMENT_MARKER);
    expect(runSession.mock.calls[0]?.[0].prompt).toContain(
      `## The bot's merge-risk block\n\n<!-- ${RISK_MARKER}_start -->`,
    );
  });

  // A head the bot skipped carries commits no review read, so the text alone never settles it: the session is
  // Handed the range and merges only on its own reading of it
  test("judges a head the bot skipped through the session, over the commits no review read", async () => {
    expect.hasAssertions();

    const unreviewedFromSha = readSha("HEAD");
    const developSha = publish(DEVELOP_BRANCH, commitFile(TEST_FILENAME, ""));
    answerWith(`${ReleaseVerdict.Merge} — nothing is left`);
    const outcome = await judgeRelease({ ...getInput(developSha), unreviewedFromSha });

    expect(outcome?.kind).toBe(CycleOutcomeKind.Merged);
    expect(readReleaseGate).not.toHaveBeenCalled();
    expect(runSession.mock.calls[0]?.[0].prompt).toContain(`git log -p ${unreviewedFromSha}..${developSha}`);
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
