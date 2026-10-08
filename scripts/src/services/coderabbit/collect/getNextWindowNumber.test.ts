import type { WindowPullRequest } from "#src/models/coderabbit/collect/WindowPullRequest";

import { WindowPullRequestState } from "#src/models/coderabbit/collect/WindowPullRequestState";
import { MAIN_BRANCH } from "#src/services/coderabbit/collect/constants";
import { getNextWindowNumber } from "#src/services/coderabbit/collect/getNextWindowNumber";
import { getWindowBranch } from "#src/services/coderabbit/collect/getWindowBranch";
import { describe, expect, test } from "vitest";

const getWindowPullRequest = (headRefName: string, state: WindowPullRequestState): WindowPullRequest => ({
  baseRefName: MAIN_BRANCH,
  createdAt: Temporal.Instant.fromEpochMilliseconds(0).toString(),
  headRefName,
  number: 0,
  state,
});

describe(getNextWindowNumber, () => {
  test("numbers the first window one", () => {
    expect.hasAssertions();

    expect(getNextWindowNumber([])).toBe(1);
  });

  test("counts a closed window's number as taken", () => {
    expect.hasAssertions();

    const windowPullRequests = [
      getWindowPullRequest(getWindowBranch(1), WindowPullRequestState.Merged),
      getWindowPullRequest(getWindowBranch(4), WindowPullRequestState.Closed),
      getWindowPullRequest(getWindowBranch(2), WindowPullRequestState.Open),
    ];

    expect(getNextWindowNumber(windowPullRequests)).toBe(5);
  });

  test("skips a head under the prefix that is not numbered, and every head outside it", () => {
    expect.hasAssertions();

    const windowPullRequests = [
      getWindowPullRequest(`${getWindowBranch(0)}x`, WindowPullRequestState.Open),
      getWindowPullRequest("develop", WindowPullRequestState.Merged),
    ];

    expect(getNextWindowNumber(windowPullRequests)).toBe(1);
  });
});
