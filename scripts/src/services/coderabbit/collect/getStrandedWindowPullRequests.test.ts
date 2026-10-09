import type { WindowPullRequest } from "#src/models/coderabbit/collect/WindowPullRequest";

import { WindowPullRequestState } from "#src/models/coderabbit/collect/WindowPullRequestState";
import { MAIN_BRANCH, WINDOW_BRANCH_PREFIX } from "#src/services/coderabbit/collect/constants";
import { getStrandedWindowPullRequests } from "#src/services/coderabbit/collect/getStrandedWindowPullRequests";
import { describe, expect, test } from "vitest";

describe(getStrandedWindowPullRequests, () => {
  const createdAt = Temporal.Instant.fromEpochMilliseconds(0).toString();
  const mergedWindowPullRequest: WindowPullRequest = {
    baseRefName: MAIN_BRANCH,
    createdAt,
    headRefName: `${WINDOW_BRANCH_PREFIX}1`,
    headRefOid: "",
    number: 1,
    state: WindowPullRequestState.Merged,
  };
  const openWindowPullRequest: WindowPullRequest = {
    baseRefName: mergedWindowPullRequest.headRefName,
    createdAt,
    headRefName: `${WINDOW_BRANCH_PREFIX}2`,
    headRefOid: "",
    number: 2,
    state: WindowPullRequestState.Open,
  };

  test("returns the open window stacked on a merged window's head", () => {
    expect.hasAssertions();

    expect(
      getStrandedWindowPullRequests([openWindowPullRequest], [mergedWindowPullRequest, openWindowPullRequest]),
    ).toStrictEqual([openWindowPullRequest]);
  });

  test("leaves a window on main, or on a closed head, alone", () => {
    expect.hasAssertions();

    const closedWindowPullRequest: WindowPullRequest = {
      ...mergedWindowPullRequest,
      headRefName: `${WINDOW_BRANCH_PREFIX}3`,
      headRefOid: "",
      number: 3,
      state: WindowPullRequestState.Closed,
    };
    const onClosedWindowPullRequest: WindowPullRequest = {
      ...openWindowPullRequest,
      baseRefName: closedWindowPullRequest.headRefName,
    };
    const onMainWindowPullRequest: WindowPullRequest = { ...openWindowPullRequest, baseRefName: MAIN_BRANCH };

    expect(
      getStrandedWindowPullRequests(
        [onClosedWindowPullRequest, onMainWindowPullRequest],
        [closedWindowPullRequest, onClosedWindowPullRequest, onMainWindowPullRequest],
      ),
    ).toStrictEqual([]);
  });
});
