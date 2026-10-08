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

  test("refuses two window pull requests on the base of main", () => {
    expect.hasAssertions();

    expect(() =>
      orderWindowStack([getWindowPullRequest(1, MAIN_BRANCH), getWindowPullRequest(2, MAIN_BRANCH)]),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: coderabbit, the window stack forks on main — #1, #2 share its base]`,
    );
  });

  test("refuses two window pull requests on one base", () => {
    expect.hasAssertions();

    const bottom = getWindowPullRequest(1, MAIN_BRANCH);

    expect(() =>
      orderWindowStack([
        bottom,
        getWindowPullRequest(2, getWindowBranch(1)),
        getWindowPullRequest(3, getWindowBranch(1)),
      ]),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: coderabbit, the window stack forks on review/1 — #2, #3 share its base]`,
    );
  });

  test("refuses a window whose base no open window carries", () => {
    expect.hasAssertions();

    expect(() => orderWindowStack([getWindowPullRequest(2, getWindowBranch(1))])).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: coderabbit, the window stack has a gap — 1 open window pull requests are not reached from main]`,
    );
  });

  test("refuses a loop among open windows rather than walking it forever", () => {
    expect.hasAssertions();

    const bottom = getWindowPullRequest(1, MAIN_BRANCH);
    const middle = getWindowPullRequest(2, getWindowBranch(1));
    // Two open windows on one head: its base chain returns to the middle window
    const looping = { ...getWindowPullRequest(3, getWindowBranch(2)), headRefName: getWindowBranch(1) };

    expect(() => orderWindowStack([bottom, middle, looping])).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: coderabbit, the window stack loops at #2]`,
    );
  });
});
