import type { WindowPullRequest } from "#src/models/coderabbit/collect/WindowPullRequest";

import { WindowPullRequestState } from "#src/models/coderabbit/collect/WindowPullRequestState";
import { MAIN_BRANCH } from "#src/services/coderabbit/collect/constants";
import { getWindowBranch } from "#src/services/coderabbit/collect/getWindowBranch";
import { markFoldedWindowsMerged } from "#src/services/coderabbit/collect/markFoldedWindowsMerged";
import { setupFixtureRepository } from "#src/services/coderabbit/collect/setupFixtureRepository.test";
import { describe, expect, test } from "vitest";

const getWindowPullRequest = (number: number, headRefOid: string): WindowPullRequest => ({
  baseRefName: MAIN_BRANCH,
  createdAt: Temporal.Instant.fromEpochMilliseconds(0).toString(),
  headRefName: getWindowBranch(number),
  headRefOid,
  number,
  state: WindowPullRequestState.Closed,
});

describe(markFoldedWindowsMerged, () => {
  const { commitFile, getCwd, readSha, switchTo } = setupFixtureRepository();

  test("reads a closed window whose head main carries as merged", () => {
    expect.hasAssertions();

    const folded = commitFile("a", "a");

    expect(markFoldedWindowsMerged([getWindowPullRequest(1, folded)], readSha("HEAD"), getCwd())).toStrictEqual([
      { ...getWindowPullRequest(1, folded), state: WindowPullRequestState.Merged },
    ]);
  });

  test("keeps a closed window whose head main does not carry closed", () => {
    expect.hasAssertions();

    const base = readSha("HEAD");
    const paused = commitFile("a", "a");
    switchTo(base);
    const closed = getWindowPullRequest(1, paused);

    expect(markFoldedWindowsMerged([closed], base, getCwd())).toStrictEqual([closed]);
  });
});
