import type { WindowPullRequest } from "#src/models/coderabbit/collect/WindowPullRequest";
import type { runGh as baseRunGh } from "#src/services/shared/runGh";

import { WindowPullRequestState } from "#src/models/coderabbit/collect/WindowPullRequestState";
import { MAIN_BRANCH } from "#src/services/coderabbit/collect/constants";
import { getWindowBranch } from "#src/services/coderabbit/collect/getWindowBranch";
import { replyRelandedAnswers } from "#src/services/coderabbit/collect/replyRelandedAnswers";
import { describe, expect, test, vi } from "vitest";

const { runGh } = vi.hoisted(() => ({ runGh: vi.fn<typeof baseRunGh>() }));

vi.mock(import("#src/services/shared/runGh"), () => ({ runGh: runGh as unknown as typeof baseRunGh }));

const getWindow = (number: number, state: WindowPullRequestState): WindowPullRequest => ({
  baseRefName: MAIN_BRANCH,
  createdAt: new Date(0).toISOString(),
  headRefName: getWindowBranch(number),
  headRefOid: "",
  number,
  state,
});

describe(replyRelandedAnswers, () => {
  const viewerLogin = "viewerLogin";

  // No opening replies on a merged window older than the newest, so a parked fix's finding there is answered here
  test("replies on the older merged window whose finding the fix answers, and searches no further", () => {
    expect.hasAssertions();

    const commentId = 1;
    const sha = "a".repeat(40);
    runGh.mockImplementation(([, path = ""]) =>
      JSON.stringify([
        path === "repos/{owner}/{repo}/pulls/2/comments?per_page=100"
          ? [{ body: "", id: commentId, updated_at: "", user: { login: "" } }]
          : [],
      ]),
    );
    replyRelandedAnswers({
      commit: { answers: [commentId], drains: [], sha, subject: "a" },
      isDryRun: false,
      viewerLogin,
      windowHistory: [
        getWindow(1, WindowPullRequestState.Merged),
        getWindow(2, WindowPullRequestState.Merged),
        getWindow(3, WindowPullRequestState.Merged),
        getWindow(4, WindowPullRequestState.Open),
      ],
    });

    expect(runGh.mock.calls.filter(([[, path = ""]]) => path.endsWith("/replies"))).toStrictEqual([
      [["api", `repos/{owner}/{repo}/pulls/2/comments/${commentId}/replies`, "-f", `body=Agreed, fixed in ${sha} — a`]],
    ]);
    expect(runGh.mock.calls.some(([[, path = ""]]) => path.includes("/pulls/1/"))).toBe(false);
  });
});
