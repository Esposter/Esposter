import { WindowPullRequestState } from "#src/models/coderabbit/collect/WindowPullRequestState";
import { getNewestMergedPullRequest } from "#src/services/coderabbit/collect/getNewestMergedPullRequest";
import { describe, expect, test } from "vitest";

describe(getNewestMergedPullRequest, () => {
  test("picks the highest-numbered merged pull request, whatever else is open or closed", () => {
    expect.hasAssertions();

    expect(
      getNewestMergedPullRequest([
        { number: 1, state: WindowPullRequestState.Merged },
        { number: 2, state: WindowPullRequestState.Open },
        { number: 3, state: WindowPullRequestState.Merged },
        { number: 4, state: WindowPullRequestState.Closed },
      ]),
    ).toBe(3);
  });

  test("finds none when nothing merged", () => {
    expect.hasAssertions();

    expect(getNewestMergedPullRequest([{ number: 1, state: WindowPullRequestState.Closed }])).toBeUndefined();
  });
});
