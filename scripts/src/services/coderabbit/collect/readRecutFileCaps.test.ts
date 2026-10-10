import type { WindowPullRequest } from "#src/models/coderabbit/collect/WindowPullRequest";
import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";
import type { runGh as baseRunGh } from "#src/services/shared/runGh";

import { WindowPullRequestState } from "#src/models/coderabbit/collect/WindowPullRequestState";
import { MAIN_BRANCH, WINDOW_RECUT_MARKER } from "#src/services/coderabbit/collect/constants";
import { getWindowBranch } from "#src/services/coderabbit/collect/getWindowBranch";
import { readRecutFileCaps } from "#src/services/coderabbit/collect/readRecutFileCaps";
import { describe, expect, test, vi } from "vitest";

const { runGh } = vi.hoisted(() => ({ runGh: vi.fn<typeof baseRunGh>() }));

vi.mock(import("#src/services/shared/runGh"), () => ({ runGh: runGh as unknown as typeof baseRunGh }));

describe(readRecutFileCaps, () => {
  const viewerLogin = "viewerLogin";
  const fileCap = 1;
  const getWindow = (number: number, state: WindowPullRequestState): WindowPullRequest => ({
    baseRefName: MAIN_BRANCH,
    createdAt: new Date(0).toISOString(),
    headRefName: getWindowBranch(number),
    headRefOid: "",
    number,
    state,
  });
  const getRecutComment = (login: string): GitHubEntry => ({
    body: `<!-- ${WINDOW_RECUT_MARKER} cap:${fileCap} -->`,
    id: 0,
    updated_at: new Date(0).toISOString(),
    user: { login },
  });

  // A merge means a window under that cap was reviewed, so a re-cut below it caps nothing after it
  test("reads the cap each closed window above the newest merged one was re-cut to", () => {
    expect.hasAssertions();

    runGh.mockReturnValue(JSON.stringify([[getRecutComment(viewerLogin)]]));

    expect(
      readRecutFileCaps(
        [
          getWindow(2, WindowPullRequestState.Closed),
          getWindow(1, WindowPullRequestState.Merged),
          getWindow(0, WindowPullRequestState.Closed),
        ],
        viewerLogin,
      ),
    ).toStrictEqual(new Map([[2, fileCap]]));
  });

  // Every comment is public, so a cap anyone else wrote would let them size the collector's windows
  test("reads no cap from a stranger's marker", () => {
    expect.hasAssertions();

    runGh.mockReturnValue(JSON.stringify([[getRecutComment("")]]));

    expect(readRecutFileCaps([getWindow(0, WindowPullRequestState.Closed)], viewerLogin)).toStrictEqual(new Map());
  });
});
