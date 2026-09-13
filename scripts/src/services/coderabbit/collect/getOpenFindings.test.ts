import type { ReviewThread } from "#src/models/coderabbit/shared/ReviewThread";

import { getOpenFindings } from "#src/services/coderabbit/collect/getOpenFindings";
import { CODERABBIT_GRAPHQL_LOGIN } from "#src/services/coderabbit/shared/constants";
import { describe, expect, test } from "vitest";

const getThread = (commentId: number, lastAuthorLogin: string): ReviewThread => ({
  body: "**A finding**",
  commentId,
  lastAuthorLogin,
  path: "apps/web/app.vue",
});

describe(getOpenFindings, () => {
  test("keeps a thread the bot spoke last on and nothing answers", () => {
    expect.hasAssertions();

    const thread = getThread(1, CODERABBIT_GRAPHQL_LOGIN);

    expect(getOpenFindings([thread], new Set())).toStrictEqual([thread]);
  });

  test("drops a thread a person answered", () => {
    expect.hasAssertions();

    expect(getOpenFindings([getThread(1, "Q16solver")], new Set())).toStrictEqual([]);
  });

  test("drops a thread an unported commit's trailer names", () => {
    expect.hasAssertions();

    expect(getOpenFindings([getThread(1, CODERABBIT_GRAPHQL_LOGIN)], new Set([1]))).toStrictEqual([]);
  });
});
