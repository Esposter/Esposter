import type { WindowPullRequest } from "#src/models/coderabbit/collect/WindowPullRequest";

import { WindowPullRequestState } from "#src/models/coderabbit/collect/WindowPullRequestState";
import { MAIN_BRANCH } from "#src/services/coderabbit/collect/constants";
import { getWindowBranch } from "#src/services/coderabbit/collect/getWindowBranch";
import { orderWindowStack } from "#src/services/coderabbit/collect/orderWindowStack";
import { describe, expect, test } from "vitest";

const getWindowPullRequest = (number: number, baseRefName: string): WindowPullRequest => ({
  baseRefName,
  createdAt: Temporal.Instant.fromEpochMilliseconds(0).toString(),
  headRefName: getWindowBranch(number),
  headRefOid: "",
  number,
  state: WindowPullRequestState.Open,
});

describe(orderWindowStack, () => {
  test("orders the stack bottom up whatever order it is listed in", () => {
    expect.hasAssertions();

    const bottom = getWindowPullRequest(1, MAIN_BRANCH);
    const middle = getWindowPullRequest(2, getWindowBranch(1));
    const top = getWindowPullRequest(3, getWindowBranch(2));

    expect(orderWindowStack([top, bottom, middle])).toStrictEqual([bottom, middle, top]);
  });

  test("orders nothing as nothing", () => {
    expect.hasAssertions();

    expect(orderWindowStack([])).toStrictEqual([]);
  });

  test("leaves every window off the chain when two share the base of main", () => {
    expect.hasAssertions();

    expect(
      orderWindowStack([getWindowPullRequest(1, MAIN_BRANCH), getWindowPullRequest(2, MAIN_BRANCH)]),
    ).toStrictEqual([]);
  });

  test("ends the chain below a fork, with the windows above it left off", () => {
    expect.hasAssertions();

    const bottom = getWindowPullRequest(1, MAIN_BRANCH);

    expect(
      orderWindowStack([
        bottom,
        getWindowPullRequest(2, getWindowBranch(1)),
        getWindowPullRequest(3, getWindowBranch(1)),
        getWindowPullRequest(4, getWindowBranch(3)),
      ]),
    ).toStrictEqual([bottom]);
  });

  test("ends the chain at a gap, with the windows above it left off", () => {
    expect.hasAssertions();

    const bottom = getWindowPullRequest(1, MAIN_BRANCH);

    expect(
      orderWindowStack([
        bottom,
        getWindowPullRequest(3, getWindowBranch(2)),
        getWindowPullRequest(4, getWindowBranch(3)),
      ]),
    ).toStrictEqual([bottom]);
  });

  test("leaves a second window on one head off the chain rather than walking it forever", () => {
    expect.hasAssertions();

    const bottom = getWindowPullRequest(1, MAIN_BRANCH);
    const middle = getWindowPullRequest(2, getWindowBranch(1));
    // Two open windows on one head: its base chain returns to the middle window
    const looping = { ...getWindowPullRequest(3, getWindowBranch(2)), headRefName: getWindowBranch(1) };

    expect(orderWindowStack([bottom, middle, looping])).toStrictEqual([bottom, middle]);
  });
});
