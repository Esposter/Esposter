import { getChangedExcludes } from "#src/services/exec/wsl/getChangedExcludes";
import { AGENT_WORKTREES_DIRECTORY } from "@esposter/configuration";
import { describe, expect, test } from "vitest";

describe(getChangedExcludes, () => {
  const NODE_MODULES_EXCLUDE = "node_modules";
  const WORKTREE_EXCLUDE = `./${AGENT_WORKTREES_DIRECTORY}`;
  const NUXT_OUTPUT_EXCLUDE = "./packages/app/.nuxt";

  test("returns the excludes only one side holds, in both directions", () => {
    expect.hasAssertions();

    expect(
      getChangedExcludes([NODE_MODULES_EXCLUDE, WORKTREE_EXCLUDE], [NODE_MODULES_EXCLUDE, NUXT_OUTPUT_EXCLUDE]),
    ).toStrictEqual([WORKTREE_EXCLUDE, NUXT_OUTPUT_EXCLUDE]);
  });

  test("reports no change for the same set in a different order", () => {
    expect.hasAssertions();

    expect(
      getChangedExcludes([NODE_MODULES_EXCLUDE, WORKTREE_EXCLUDE], [WORKTREE_EXCLUDE, NODE_MODULES_EXCLUDE]),
    ).toStrictEqual([]);
  });

  // A changed exclude reaches both consumers — the planner's bare-name test and the diff's delete list — so a repeat
  // Would make one delete path appear twice in a staged `rm -rf` list.
  test("reports a changed exclude once even when a side lists it twice", () => {
    expect.hasAssertions();

    expect(getChangedExcludes([], [WORKTREE_EXCLUDE, WORKTREE_EXCLUDE])).toStrictEqual([WORKTREE_EXCLUDE]);
  });
});
