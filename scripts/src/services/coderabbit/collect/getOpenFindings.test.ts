import type { ReviewThread } from "#src/models/coderabbit/shared/ReviewThread";

import { getOpenFindings } from "#src/services/coderabbit/collect/getOpenFindings";
import { CODERABBIT_GRAPHQL_LOGIN } from "#src/services/coderabbit/shared/constants";
import { describe, expect, test } from "vitest";

const getThread = (
  commentId: number,
  lastAuthorLogin: string,
  replyAuthorLogins: string[] = [],
  lastBody = "",
): ReviewThread => ({
  body: "**A finding**",
  commentId,
  lastAuthorLogin,
  lastBody,
  path: "apps/web/app.vue",
  replyAuthorLogins,
});

describe(getOpenFindings, () => {
  const viewerLogin = "viewerLogin";

  test("keeps a thread the bot spoke last on and nothing answers", () => {
    expect.hasAssertions();

    const thread = getThread(1, CODERABBIT_GRAPHQL_LOGIN);

    expect(getOpenFindings([thread], new Set(), viewerLogin)).toStrictEqual([thread]);
  });

  test("drops a thread a person answered", () => {
    expect.hasAssertions();

    expect(getOpenFindings([getThread(1, viewerLogin, [viewerLogin])], new Set(), viewerLogin)).toStrictEqual([]);
  });

  test("drops a thread an unported commit's trailer names", () => {
    expect.hasAssertions();

    expect(getOpenFindings([getThread(1, CODERABBIT_GRAPHQL_LOGIN)], new Set([1]), viewerLogin)).toStrictEqual([]);
  });

  // The bot answered a rejection with an analysis chain, and the drain rejected the same finding a second time
  test("closes a thread whose newest bot comment answers the viewer's reply without a suggestion", () => {
    expect.hasAssertions();

    const thread = getThread(1, CODERABBIT_GRAPHQL_LOGIN, [viewerLogin, CODERABBIT_GRAPHQL_LOGIN]);

    expect(getOpenFindings([thread], new Set(), viewerLogin)).toStrictEqual([]);
  });

  test("keeps a thread whose newest bot comment after the viewer's reply carries a committable suggestion", () => {
    expect.hasAssertions();

    const thread = getThread(
      1,
      CODERABBIT_GRAPHQL_LOGIN,
      [viewerLogin, CODERABBIT_GRAPHQL_LOGIN],
      "Committable suggestion",
    );

    expect(getOpenFindings([thread], new Set(), viewerLogin)).toStrictEqual([thread]);
  });
});
