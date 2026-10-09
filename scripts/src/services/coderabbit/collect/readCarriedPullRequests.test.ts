import type { WindowPullRequest } from "#src/models/coderabbit/collect/WindowPullRequest";
import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";
import type { runGh as baseRunGh } from "#src/services/shared/runGh";

import { WindowPullRequestState } from "#src/models/coderabbit/collect/WindowPullRequestState";
import { MAIN_BRANCH, WINDOW_RECUT_MARKER } from "#src/services/coderabbit/collect/constants";
import { getWindowBranch } from "#src/services/coderabbit/collect/getWindowBranch";
import { readCarriedPullRequests } from "#src/services/coderabbit/collect/readCarriedPullRequests";
import { describe, expect, test, vi } from "vitest";

const { runGh } = vi.hoisted(() => ({ runGh: vi.fn<typeof baseRunGh>() }));

vi.mock(import("#src/services/shared/runGh"), () => ({ runGh: runGh as unknown as typeof baseRunGh }));

const getWindow = (number: number, state: WindowPullRequestState): WindowPullRequest => ({
  baseRefName: MAIN_BRANCH,
  createdAt: new Date(0).toISOString(),
  headRefName: getWindowBranch(number),
  headRefOid: "",
  number,
  state,
});

describe(readCarriedPullRequests, () => {
  const viewerLogin = "viewerLogin";
  // The windows whose comments carry the collector's re-cut marker
  const answerRecutComments = (recutNumbers: number[]): void => {
    runGh.mockImplementation(([, path = ""]) => {
      const comment: GitHubEntry = {
        body: `<!-- ${WINDOW_RECUT_MARKER} cap:1 -->`,
        id: 0,
        updated_at: new Date(0).toISOString(),
        user: { login: viewerLogin },
      };
      return JSON.stringify([recutNumbers.some((number) => path.includes(`issues/${number}/`)) ? [comment] : []]);
    });
  };

  // A re-cut closes windows whose reviews may have completed, and their commits come back in the window above them
  test("carries the re-cut windows directly below a window, newest first, up to the first that is not one", () => {
    expect.hasAssertions();

    answerRecutComments([1, 3, 4]);

    expect(
      readCarriedPullRequests(
        [
          getWindow(5, WindowPullRequestState.Open),
          getWindow(1, WindowPullRequestState.Closed),
          getWindow(4, WindowPullRequestState.Closed),
          getWindow(2, WindowPullRequestState.Merged),
          getWindow(3, WindowPullRequestState.Closed),
        ],
        5,
        viewerLogin,
      ),
    ).toStrictEqual([4, 3]);
  });

  // A window a person closed is a pause, and its findings are no replacement's to answer
  test("carries nothing past a closed window no re-cut marked", () => {
    expect.hasAssertions();

    answerRecutComments([1]);

    expect(
      readCarriedPullRequests(
        [
          getWindow(1, WindowPullRequestState.Closed),
          getWindow(2, WindowPullRequestState.Closed),
          getWindow(3, WindowPullRequestState.Merged),
        ],
        3,
        viewerLogin,
      ),
    ).toStrictEqual([]);
  });

  test("carries nothing for a pull request that is no window", () => {
    expect.hasAssertions();

    answerRecutComments([1]);

    expect(readCarriedPullRequests([getWindow(1, WindowPullRequestState.Closed)], 2, viewerLogin)).toStrictEqual([]);
  });
});
