import type { ReviewThread } from "#src/models/coderabbit/shared/ReviewThread";

import { getDrainPrompt } from "#src/services/coderabbit/collect/getDrainPrompt";
import { CODERABBIT_GRAPHQL_LOGIN } from "#src/services/coderabbit/shared/constants";
import { describe, expect, test } from "vitest";

const getThread = (commentId: number): ReviewThread => ({
  body: `finding ${commentId}`,
  commentId,
  lastAuthorLogin: CODERABBIT_GRAPHQL_LOGIN,
  path: "path",
});

const getCommentOrder = (prompt: string) =>
  Array.from(prompt.matchAll(/### comment (?<commentId>\d+)/gu), ({ groups }) => Number(groups?.commentId));

describe(getDrainPrompt, () => {
  const input = {
    feedback: "feedback",
    openThreads: [getThread(1), getThread(2), getThread(3)],
    pullRequest: 0,
    rejectionsPath: "rejections",
    verdictPath: "verdict",
  };

  // A session is one-shot and may end mid-round, so the severest finding is the one it must meet first
  test("puts the severest finding first", () => {
    expect.hasAssertions();

    const commentIdSeverityMap = new Map([
      [1, 0],
      [2, 2],
      [3, 1],
    ]);

    expect(getCommentOrder(getDrainPrompt({ ...input, commentIdSeverityMap }))).toStrictEqual([2, 3, 1]);
  });

  // Nothing scored them, so the reviewer's own order is the one there is
  test("keeps the reviewer's order when nothing scored the findings", () => {
    expect.hasAssertions();

    expect(getCommentOrder(getDrainPrompt(input))).toStrictEqual([1, 2, 3]);
  });
});
