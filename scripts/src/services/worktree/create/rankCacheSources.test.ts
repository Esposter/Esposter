import { rankCacheSources } from "#src/services/worktree/create/rankCacheSources";
import { describe, expect, test } from "vitest";

describe(rankCacheSources, () => {
  test("ranks the fewest changed build directories first, then the most recently recorded", () => {
    expect.hasAssertions();

    expect(
      rankCacheSources([
        { changedDirectories: 2, path: "/worktrees/newest-but-changed", recordedAt: 300 },
        { changedDirectories: 0, path: "/worktrees/older", recordedAt: 100 },
        { changedDirectories: 0, path: "/worktrees/newer", recordedAt: 200 },
      ]),
    ).toStrictEqual(["/worktrees/newer", "/worktrees/older", "/worktrees/newest-but-changed"]);
  });

  test("ranks none when there is no candidate", () => {
    expect.hasAssertions();

    expect(rankCacheSources([])).toStrictEqual([]);
  });
});
