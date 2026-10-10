import type { runSession as baseRunSession } from "#src/services/coderabbit/collect/runSession";
import type { runGh as baseRunGh } from "#src/services/shared/runGh";

import { DRAIN_FAILED_MARKER, SESSION_ATTEMPT_CAP } from "#src/services/coderabbit/collect/constants";
import { drainFindings } from "#src/services/coderabbit/collect/drainFindings";
import { getMarker } from "#src/services/coderabbit/collect/getMarker";
import { CODERABBIT_GRAPHQL_LOGIN } from "#src/services/coderabbit/shared/constants";
import { describe, expect, test, vi } from "vitest";

const { runGh, runSession } = vi.hoisted(() => ({
  runGh: vi.fn<typeof baseRunGh>(),
  runSession: vi.fn<typeof baseRunSession>(),
}));

vi.mock(import("#src/services/coderabbit/collect/runSession"), () => ({
  runSession: runSession as unknown as typeof baseRunSession,
}));

vi.mock(import("#src/services/shared/runGh"), () => ({ runGh: runGh as unknown as typeof baseRunGh }));

describe(drainFindings, () => {
  const collectorSha = "collectorSha";
  const newestReviewId = 0;
  const viewerLogin = "viewerLogin";

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
        openThreads: [
          {
            body: "",
            commentId: 1,
            lastAuthorLogin: CODERABBIT_GRAPHQL_LOGIN,
            lastBody: "",
            path: "path",
            replyAuthorLogins: [],
          },
        ],
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
});
