import type { WindowPullRequest } from "#src/models/coderabbit/collect/WindowPullRequest";

import { WindowPullRequestState } from "#src/models/coderabbit/collect/WindowPullRequestState";
import { MAIN_BRANCH } from "#src/services/coderabbit/collect/constants";
import { getWindowBranch } from "#src/services/coderabbit/collect/getWindowBranch";
import { getWindowFileCap } from "#src/services/coderabbit/collect/getWindowFileCap";
import { REVIEW_FILE_CAP } from "#src/services/coderabbit/shared/constants";
import { describe, expect, test } from "vitest";

const getWindow = (number: number, state: WindowPullRequestState): WindowPullRequest => ({
  baseRefName: MAIN_BRANCH,
  createdAt: new Date(0).toISOString(),
  headRefName: getWindowBranch(number),
  headRefOid: "",
  number,
  state,
});

describe(getWindowFileCap, () => {
  const halvedFileCap = Math.floor(REVIEW_FILE_CAP / 2);
  const windowHistory = [getWindow(0, WindowPullRequestState.Merged), getWindow(1, WindowPullRequestState.Closed)];

  test.each([
    ["half the cap when the newest window was re-cut to it", new Map([[1, halvedFileCap]]), halvedFileCap],
    ["the full cap when only an older window was re-cut", new Map([[0, halvedFileCap]]), REVIEW_FILE_CAP],
  ])("cuts the next window to %s", (_description, recutFileCaps, expected) => {
    expect.hasAssertions();

    expect(getWindowFileCap(windowHistory, recutFileCaps)).toBe(expected);
  });
});
