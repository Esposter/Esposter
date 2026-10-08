import type { WindowPullRequest } from "#src/models/coderabbit/collect/WindowPullRequest";

import { WindowPullRequestState } from "#src/models/coderabbit/collect/WindowPullRequestState";
import { MAIN_BRANCH, WINDOW_OPENING_WINDOW_MS } from "#src/services/coderabbit/collect/constants";
import { getOpenedInLastHour } from "#src/services/coderabbit/collect/getOpenedInLastHour";
import { getWindowBranch } from "#src/services/coderabbit/collect/getWindowBranch";
import { describe, expect, test } from "vitest";

const getWindowPullRequest = (number: number, createdAtMs: number): WindowPullRequest => ({
  baseRefName: MAIN_BRANCH,
  createdAt: Temporal.Instant.fromEpochMilliseconds(createdAtMs).toString(),
  headRefName: getWindowBranch(number),
  headRefOid: "",
  number,
  state: WindowPullRequestState.Closed,
});

describe(getOpenedInLastHour, () => {
  const NOW_MS = Temporal.Instant.fromEpochMilliseconds(0).epochMilliseconds + WINDOW_OPENING_WINDOW_MS;

  test("counts the windows created within the hour before now, whatever their state", () => {
    expect.hasAssertions();

    const windowPullRequests = [
      getWindowPullRequest(1, NOW_MS - WINDOW_OPENING_WINDOW_MS - 1),
      getWindowPullRequest(2, NOW_MS - WINDOW_OPENING_WINDOW_MS + 1),
      getWindowPullRequest(3, NOW_MS),
    ];

    expect(getOpenedInLastHour(windowPullRequests, NOW_MS)).toBe(2);
  });

  test("counts nothing over an empty history", () => {
    expect.hasAssertions();

    expect(getOpenedInLastHour([], NOW_MS)).toBe(0);
  });
});
