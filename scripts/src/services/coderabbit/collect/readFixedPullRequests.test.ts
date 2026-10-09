import type { runGh as baseRunGh } from "#src/services/shared/runGh";

import { WindowPullRequestState } from "#src/models/coderabbit/collect/WindowPullRequestState";
import { MAIN_BRANCH, PULL_REQUEST_LIST_LIMIT } from "#src/services/coderabbit/collect/constants";
import { TEST_FILENAME } from "#src/services/coderabbit/collect/constants.test";
import { getWindowBranch } from "#src/services/coderabbit/collect/getWindowBranch";
import { readFixedPullRequests } from "#src/services/coderabbit/collect/readFixedPullRequests";
import { setupFixtureRepository } from "#src/services/coderabbit/collect/setupFixtureRepository.test";
import { describe, expect, test, vi } from "vitest";

const { runGh } = vi.hoisted(() => ({ runGh: vi.fn<typeof baseRunGh>() }));

vi.mock(import("#src/services/shared/runGh"), () => ({ runGh: runGh as unknown as typeof baseRunGh }));

// A merged window opened at `createdAtMs`
const getWindow = (number: number, createdAtMs: number) => ({
  baseRefName: MAIN_BRANCH,
  createdAt: Temporal.Instant.fromEpochMilliseconds(createdAtMs).toString(),
  headRefName: getWindowBranch(number),
  headRefOid: "",
  isCrossRepository: false,
  number,
  state: WindowPullRequestState.Merged,
});

describe(readFixedPullRequests, () => {
  const { commitFile, getCwd } = setupFixtureRepository();

  // Fixes the cap cut over two windows: the second part opens after the first merged, so the newest window is the
  // First part's own, opened after the review both parts answer had merged
  test("reads the reviews merged since the newest window opened before the fix was written", () => {
    expect.hasAssertions();

    const fixSha = commitFile(TEST_FILENAME, "");
    const reviewedWindow = getWindow(1, 0);
    runGh.mockImplementation((args) =>
      args.includes("--search")
        ? JSON.stringify([{ number: reviewedWindow.number }])
        : JSON.stringify([getWindow(2, 1), reviewedWindow]),
    );

    expect(readFixedPullRequests(fixSha, getCwd())).toStrictEqual([reviewedWindow.number]);
    expect(runGh.mock.calls.at(-1)).toStrictEqual([
      [
        "pr",
        "list",
        "--state",
        "merged",
        "--search",
        `merged:>=${reviewedWindow.createdAt}`,
        "--limit",
        PULL_REQUEST_LIST_LIMIT.toString(),
        "--json",
        "number",
      ],
    ]);
  });
});
