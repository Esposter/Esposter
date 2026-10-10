import type { WindowPullRequest } from "#src/models/coderabbit/collect/WindowPullRequest";

import { WindowPullRequestState } from "#src/models/coderabbit/collect/WindowPullRequestState";
import { MAIN_BRANCH, WINDOW_OPENING_WINDOW_MS } from "#src/services/coderabbit/collect/constants";
import { getOpeningWaitMs } from "#src/services/coderabbit/collect/getOpeningWaitMs";
import { getWindowBranch } from "#src/services/coderabbit/collect/getWindowBranch";
import { describe, expect, test } from "vitest";

const getWindowPullRequest = (number: number, createdAtMs: number): WindowPullRequest => ({
  baseRefName: MAIN_BRANCH,
  createdAt: Temporal.Instant.fromEpochMilliseconds(createdAtMs).toString(),
  headRefName: getWindowBranch(number),
  headRefOid: "",
  number,
  state: WindowPullRequestState.Merged,
});

describe(getOpeningWaitMs, () => {
  const NOW_MS = Temporal.Instant.fromEpochMilliseconds(0).epochMilliseconds + WINDOW_OPENING_WINDOW_MS;

  test("waits for the oldest window opened within the hour to age out of it", () => {
    expect.hasAssertions();

    const windowPullRequests = [
      getWindowPullRequest(0, NOW_MS - WINDOW_OPENING_WINDOW_MS),
      getWindowPullRequest(1, NOW_MS - Temporal.Duration.from({ minutes: 50 }).total("milliseconds")),
      getWindowPullRequest(2, NOW_MS - Temporal.Duration.from({ minutes: 10 }).total("milliseconds")),
    ];

    expect(getOpeningWaitMs(windowPullRequests, NOW_MS)).toBe(
      Temporal.Duration.from({ minutes: 10 }).total("milliseconds"),
    );
  });
});
