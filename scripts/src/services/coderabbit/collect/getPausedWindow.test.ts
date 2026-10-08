import type { WindowPullRequest } from "#src/models/coderabbit/collect/WindowPullRequest";

import { WindowPullRequestState } from "#src/models/coderabbit/collect/WindowPullRequestState";
import { MAIN_BRANCH } from "#src/services/coderabbit/collect/constants";
import { getPausedWindow } from "#src/services/coderabbit/collect/getPausedWindow";
import { getWindowBranch } from "#src/services/coderabbit/collect/getWindowBranch";
import { describe, expect, test } from "vitest";

const getWindowPullRequest = (
  number: number,
  baseRefName: string,
  state: WindowPullRequestState,
): WindowPullRequest => ({
  baseRefName,
  createdAt: Temporal.Instant.fromEpochMilliseconds(0).toString(),
  headRefName: getWindowBranch(number),
  number,
  state,
});

describe(getPausedWindow, () => {
  test("pauses on the newest window closed without merging", () => {
    expect.hasAssertions();

    const closed = getWindowPullRequest(2, MAIN_BRANCH, WindowPullRequestState.Closed);

    expect(
      getPausedWindow([getWindowPullRequest(1, MAIN_BRANCH, WindowPullRequestState.Merged), closed], []),
    ).toStrictEqual(closed);
  });

  test("pauses on a closed window an open window is still stacked on", () => {
    expect.hasAssertions();

    const closed = getWindowPullRequest(1, MAIN_BRANCH, WindowPullRequestState.Closed);
    const stacked = getWindowPullRequest(3, getWindowBranch(1), WindowPullRequestState.Open);

    expect(
      getPausedWindow(
        [closed, getWindowPullRequest(2, MAIN_BRANCH, WindowPullRequestState.Merged), stacked],
        [stacked],
      ),
    ).toStrictEqual(closed);
  });

  test("does not pause on a merged history", () => {
    expect.hasAssertions();

    expect(getPausedWindow([getWindowPullRequest(1, MAIN_BRANCH, WindowPullRequestState.Merged)], [])).toBeUndefined();
  });
});
