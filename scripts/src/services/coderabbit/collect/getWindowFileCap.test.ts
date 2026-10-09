import type { WindowPullRequest } from "#src/models/coderabbit/collect/WindowPullRequest";

import { WindowPullRequestState } from "#src/models/coderabbit/collect/WindowPullRequestState";
import { MAIN_BRANCH } from "#src/services/coderabbit/collect/constants";
import { getWindowBranch } from "#src/services/coderabbit/collect/getWindowBranch";
import { getWindowFileCap } from "#src/services/coderabbit/collect/getWindowFileCap";
import { REVIEW_FILE_CAP } from "#src/services/coderabbit/shared/constants";
import { describe, expect, test } from "vitest";

const getWindow = (number: number, state: WindowPullRequestState, baseRefName = MAIN_BRANCH): WindowPullRequest => ({
  baseRefName,
  createdAt: new Date(0).toISOString(),
  headRefName: getWindowBranch(number),
  headRefOid: "",
  number,
  state,
});

describe(getWindowFileCap, () => {
  const halvedFileCap = Math.floor(REVIEW_FILE_CAP / 2);
  const recutFileCaps = new Map([[1, halvedFileCap]]);

  // A window re-cut from `main` leaves nothing open, and its replacement is cut from `main` too, under its cap
  test.each([
    ["half the cap when the newest window was re-cut to it", recutFileCaps, halvedFileCap],
    ["the full cap when only an older window was re-cut", new Map([[0, halvedFileCap]]), REVIEW_FILE_CAP],
  ])("cuts the next window to %s", (_description, fileCaps, expected) => {
    expect.hasAssertions();

    expect(
      getWindowFileCap(
        [getWindow(0, WindowPullRequestState.Merged), getWindow(1, WindowPullRequestState.Closed)],
        fileCaps,
      ),
    ).toBe(expected);
  });

  // A window re-cut from the stack is replaced over the window below it, and once that one is gone the replacement is
  // Cut from `main`, where the full cap holds
  test.each([
    ["half the cap while the window below it is open", WindowPullRequestState.Open, halvedFileCap],
    ["the full cap once the window below it merged", WindowPullRequestState.Merged, REVIEW_FILE_CAP],
  ])("cuts the replacement of a window re-cut from the stack to %s", (_description, belowState, expected) => {
    expect.hasAssertions();

    expect(
      getWindowFileCap(
        [getWindow(0, belowState), getWindow(1, WindowPullRequestState.Closed, getWindowBranch(0))],
        recutFileCaps,
      ),
    ).toBe(expected);
  });
});
