import { WindowPullRequestListState } from "#src/models/coderabbit/collect/WindowPullRequestListState";
import { WindowPullRequestState } from "#src/models/coderabbit/collect/WindowPullRequestState";
import { MAIN_BRANCH, WINDOW_BRANCH_PREFIX } from "#src/services/coderabbit/collect/constants";
import { readWindowPullRequests } from "#src/services/coderabbit/collect/readWindowPullRequests";
import { runGh } from "#src/services/shared/runGh";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/shared/runGh"), () => ({ runGh: vi.fn() }));

describe(readWindowPullRequests, () => {
  test("drops a fork's branch that carries the window prefix", () => {
    expect.hasAssertions();

    const windowPullRequest = {
      baseRefName: MAIN_BRANCH,
      createdAt: Temporal.Instant.fromEpochMilliseconds(0).toString(),
      headRefName: `${WINDOW_BRANCH_PREFIX}1`,
      isCrossRepository: false,
      number: 1,
      state: WindowPullRequestState.Open,
    };
    vi.mocked(runGh).mockReturnValue(
      JSON.stringify([
        { ...windowPullRequest, isCrossRepository: true, number: 2 },
        windowPullRequest,
        { ...windowPullRequest, headRefName: "feature", number: 3 },
      ]),
    );

    expect(readWindowPullRequests(WindowPullRequestListState.Open)).toStrictEqual([windowPullRequest]);
  });
});
