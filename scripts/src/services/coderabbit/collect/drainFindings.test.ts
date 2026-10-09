import type { runInstall as baseRunInstall } from "#src/services/coderabbit/collect/runInstall";
import type { runSession as baseRunSession } from "#src/services/coderabbit/collect/runSession";
import type { runGh as baseRunGh } from "#src/services/shared/runGh";
import type { runGit as baseRunGit } from "#src/services/shared/runGit";

import {
  ANSWERS_TRAILER,
  DRAIN_FAILED_MARKER,
  REVIEW_FIXES_BRANCH,
  SESSION_ATTEMPT_CAP,
} from "#src/services/coderabbit/collect/constants";
import { drainFindings } from "#src/services/coderabbit/collect/drainFindings";
import { getMarker } from "#src/services/coderabbit/collect/getMarker";
import { CODERABBIT_GRAPHQL_LOGIN, REVIEW_FILE_CAP } from "#src/services/coderabbit/shared/constants";
import { FIELD_SEPARATOR, RECORD_SEPARATOR } from "#src/services/shared/constants";
import { describe, expect, test, vi } from "vitest";

const { runGh, runGit, runInstall, runSession } = vi.hoisted(() => ({
  runGh: vi.fn<typeof baseRunGh>(),
  runGit: vi.fn<typeof baseRunGit>(),
  runInstall: vi.fn<typeof baseRunInstall>(),
  runSession: vi.fn<typeof baseRunSession>(),
}));

vi.mock(import("#src/services/coderabbit/collect/runSession"), () => ({
  runSession: runSession as unknown as typeof baseRunSession,
}));

// The drain switches, installs and pushes in the collector's own checkout, which a test must never move
vi.mock(import("#src/services/coderabbit/collect/runInstall"), () => ({
  runInstall: runInstall as unknown as typeof baseRunInstall,
}));

vi.mock(import("#src/services/shared/runGh"), () => ({ runGh: runGh as unknown as typeof baseRunGh }));

vi.mock(import("#src/services/shared/runGit"), () => ({ runGit: runGit as unknown as typeof baseRunGit }));

// A drain that ended clean on `headSha`, git answering the rest as `answer` says
const answerGit = (answer: (args: string[]) => string): void => {
  runSession.mockResolvedValue({ isEnded: true });
  runGit.mockImplementation((args) => (args[0] === "rev-parse" ? "headSha" : answer(args)));
};
// A push of the drain's fixes that the remote refuses with `message`
const refusePush = (message: string): void => {
  answerGit(([command]) => {
    if (command === "push") throw new Error(message);
    return "";
  });
};

describe(drainFindings, () => {
  const collectorSha = "collectorSha";
  const newestReviewId = 0;
  const viewerLogin = "viewerLogin";
  const openThread = {
    body: "",
    commentId: 1,
    lastAuthorLogin: CODERABBIT_GRAPHQL_LOGIN,
    lastBody: "",
    path: "path",
    replyAuthorLogins: [],
  };
  const drainOneFinding = () =>
    drainFindings({
      baseSha: "",
      collectorSha,
      feedback: "",
      issueComments: [],
      newestReviewId,
      openThreads: [openThread],
      pullRequest: 0,
      reviewFixesSha: undefined,
      reviewId: undefined,
      viewerLogin,
    });

  // A drain held past its cap failed every run red, and nothing merged or ported above its window until a person
  // Answered its findings
  test("defers every open finding of a review past the cap and completes the drain", async () => {
    expect.hasAssertions();

    const failedMarker = getMarker(DRAIN_FAILED_MARKER, newestReviewId, [collectorSha]);
    const issueComments = Array.from({ length: SESSION_ATTEMPT_CAP }, (_value, id) => ({
      body: `${failedMarker}\ncause ${id}`,
      id,
      updated_at: "",
      user: { login: viewerLogin },
    }));
    const reviewFixesSha = "reviewFixesSha";
    runGh
      .mockReturnValueOnce(JSON.stringify({ name: "name", owner: { login: "owner" } }))
      .mockReturnValueOnce("headSha")
      .mockReturnValueOnce("[]");

    await expect(
      drainFindings({
        baseSha: "",
        collectorSha,
        feedback: "",
        issueComments,
        newestReviewId,
        openThreads: [openThread],
        pullRequest: 0,
        reviewFixesSha,
        reviewId: 2,
        viewerLogin,
      }),
    ).resolves.toBe(reviewFixesSha);
    expect(runSession).not.toHaveBeenCalled();
    expect(runGh.mock.calls).toMatchInlineSnapshot(`
      [
        [
          [
            "repo",
            "view",
            "--json",
            "owner,name",
          ],
        ],
        [
          [
            "api",
            "repos/{owner}/{repo}/pulls/0",
            "--jq",
            ".head.sha",
          ],
        ],
        [
          [
            "issue",
            "list",
            "--state",
            "open",
            "--author",
            "viewerLogin",
            "--label",
            "ready-for-agent",
            "--limit",
            "1000",
            "--json",
            "number,body",
          ],
        ],
        [
          [
            "issue",
            "create",
            "--title",
            "Deferred findings of #0",
            "--label",
            "ready-for-agent",
            "--body",
            "<!-- review-collector drain-deferred commit:headSha -->
      The drain of #0 failed 3 times, so its open findings are deferred and the walk went on: cause 2

      - https://github.com/owner/name/pull/0#discussion_r1 — \`path\`
      - https://github.com/owner/name/pull/0#pullrequestreview-2 — body-only findings

      Answer each with a commit on \`ai/queue\` carrying \`Answers: <comment id>\`, or \`Drains: <review id>\` for the body-only findings, then close this issue.",
          ],
        ],
        [
          [
            "api",
            "repos/{owner}/{repo}/pulls/0/comments/1/replies",
            "-f",
            "body=Deferred after 3 attempts — cause 2",
          ],
        ],
        [
          [
            "pr",
            "comment",
            "0",
            "--body",
            "<!-- review-collector drains review:2 -->
      Body-only findings of review 2 are deferred:
      - after 3 attempts — cause 2",
          ],
        ],
      ]
    `);
  });

  // A refused push threw the session's fixes away uncounted, so every run paid for the same drain again with nothing to
  // Cap it: the refusal is the attempt's failure, recorded before the run ends idle
  test("counts a refused push of the fixes as the attempt's failure", async () => {
    expect.hasAssertions();

    refusePush("! [remote rejected]");

    await expect(drainOneFinding()).rejects.toThrowErrorMatchingInlineSnapshot(
      `[AttemptFailedError: Invalid operation: Update, name: coderabbit, the push of ai/review-fixes was refused: ! [remote rejected]]`,
    );
    expect(runGh).toHaveBeenCalledExactlyOnceWith([
      "pr",
      "comment",
      "0",
      "--body",
      `${getMarker(DRAIN_FAILED_MARKER, newestReviewId, [collectorSha])}\nAttempt 1 of ${SESSION_ATTEMPT_CAP} to drain review ${newestReviewId} failed — the session made fixes the push to ${REVIEW_FIXES_BRANCH} refused. See the collector run.`,
    ]);
  });

  // A server error is GitHub's outage, which the run idles out with no attempt to count
  test("counts nothing when the push meets a server error", async () => {
    expect.hasAssertions();

    refusePush("The requested URL returned error: 503");

    await expect(drainOneFinding()).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: The requested URL returned error: 503]`,
    );
    expect(runGh).not.toHaveBeenCalled();
  });

  // The port parks a fix no window can carry, and its finding reads as open again: a drain that wrote the same fix
  // Again would be paid for without end, so the fix is pushed and counted, and past the cap its findings are deferred
  test("counts a fix alone over the bot's cap as the attempt's failure", async () => {
    expect.hasAssertions();

    answerGit(([command]) => {
      if (command === "log")
        return `headSha${FIELD_SEPARATOR}${FIELD_SEPARATOR}${ANSWERS_TRAILER}: ${openThread.commentId}${RECORD_SEPARATOR}`;
      else if (command === "diff")
        return Array.from({ length: REVIEW_FILE_CAP + 1 }, (_value, index) => index).join("\n");
      return "";
    });

    await expect(drainOneFinding()).rejects.toThrowErrorMatchingInlineSnapshot(
      `[AttemptFailedError: Invalid operation: Update, name: coderabbit, the drain left headSha alone over the cap of 150 files]`,
    );
    expect(runGit).toHaveBeenCalledWith([
      "push",
      `--force-with-lease=refs/heads/${REVIEW_FIXES_BRANCH}:`,
      "origin",
      `headSha:refs/heads/${REVIEW_FIXES_BRANCH}`,
    ]);
    expect(runGh).toHaveBeenCalledExactlyOnceWith([
      "pr",
      "comment",
      "0",
      "--body",
      `${getMarker(DRAIN_FAILED_MARKER, newestReviewId, [collectorSha])}\nAttempt 1 of ${SESSION_ATTEMPT_CAP} to drain review ${newestReviewId} failed — the session left headSha alone over the cap of ${REVIEW_FILE_CAP} files. See the collector run.`,
    ]);
  });
});
