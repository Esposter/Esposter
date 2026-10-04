import type { ReviewThread } from "#src/models/coderabbit/shared/ReviewThread";

import { getUnansweredFindings } from "#src/services/coderabbit/collect/getUnansweredFindings";
import { CODERABBIT_GRAPHQL_LOGIN } from "#src/services/coderabbit/shared/constants";
import { describe, expect, test } from "vitest";

describe(getUnansweredFindings, () => {
  const commentId = 1;
  const reviewId = 2;
  const thread: ReviewThread = {
    body: "",
    commentId,
    lastAuthorLogin: CODERABBIT_GRAPHQL_LOGIN,
    lastBody: "",
    path: "",
  };
  const baseInput = { commits: [], isBodyRejected: false, openThreads: [thread], rejectedIds: [], reviewId };

  // A drain that ended clean having answered part of its findings let the window port over the rest
  test("names what the drain neither fixed nor rejected", () => {
    expect.hasAssertions();

    expect(getUnansweredFindings(baseInput)).toStrictEqual([`comment ${commentId}`, `review ${reviewId}`]);
  });

  test("names nothing once every finding is fixed or rejected", () => {
    expect.hasAssertions();

    expect(
      getUnansweredFindings({
        ...baseInput,
        commits: [{ answers: [], drains: [reviewId], sha: "", subject: "" }],
        rejectedIds: [commentId],
      }),
    ).toStrictEqual([]);
  });
});
