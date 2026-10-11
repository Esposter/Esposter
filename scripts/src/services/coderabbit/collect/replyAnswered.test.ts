import type { PullRequestComment } from "#src/models/coderabbit/collect/PullRequestComment";
import type { runGh as baseRunGh } from "#src/services/shared/runGh";

import { replyAnswered } from "#src/services/coderabbit/collect/replyAnswered";
import { CODERABBIT_REST_LOGIN } from "#src/services/coderabbit/shared/constants";
import { describe, expect, test, vi } from "vitest";

const { runGh } = vi.hoisted(() => ({ runGh: vi.fn<typeof baseRunGh>() }));

vi.mock(import("#src/services/shared/runGh"), () => ({ runGh: runGh as unknown as typeof baseRunGh }));

describe(replyAnswered, () => {
  const commentId = 1;
  const pullRequest = 0;
  const viewerLogin = "viewerLogin";
  const readArgs = ["api", `repos/{owner}/{repo}/pulls/${pullRequest}/comments?per_page=100`, "--paginate", "--slurp"];
  const getReply = (id: number, login: string): PullRequestComment => ({
    body: "",
    id,
    in_reply_to_id: commentId,
    updated_at: "",
    user: { login },
  });
  const getCommit = (sha: string) => ({ answers: [commentId], drains: [], sha, subject: "" });
  const getReplyArgs = (sha: string) => [
    "api",
    `repos/{owner}/{repo}/pulls/${pullRequest}/comments/${commentId}/replies`,
    "-f",
    `body=Agreed, fixed in ${sha} — `,
  ];
  const baseInput = { isDryRun: false, issueComments: [], pullRequest, viewerLogin };

  test("posts no second reply on a thread the viewer answered after the bot's newest comment", () => {
    expect.hasAssertions();

    runGh.mockReturnValue(JSON.stringify([[getReply(2, viewerLogin)]]));
    replyAnswered({ ...baseInput, commits: [getCommit("sha2")] });

    expect(runGh).toHaveBeenCalledExactlyOnceWith(readArgs);
  });

  test("posts one reply on a thread two commits of the range answer", () => {
    expect.hasAssertions();

    runGh.mockReturnValue(JSON.stringify([[]]));
    replyAnswered({ ...baseInput, commits: [getCommit("sha1"), getCommit("sha2")] });

    expect(runGh.mock.calls).toStrictEqual([[readArgs], [getReplyArgs("sha1")]]);
  });

  test("replies again once the bot comments after the viewer's answer", () => {
    expect.hasAssertions();

    runGh.mockReturnValue(JSON.stringify([[getReply(2, viewerLogin), getReply(3, CODERABBIT_REST_LOGIN)]]));
    replyAnswered({ ...baseInput, commits: [getCommit("sha2")] });

    expect(runGh.mock.calls).toStrictEqual([[readArgs], [getReplyArgs("sha2")]]);
  });
});
