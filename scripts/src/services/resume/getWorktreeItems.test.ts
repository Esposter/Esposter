import { getWorktreeItems } from "#src/services/resume/getWorktreeItems";
import { describe, expect, test } from "vitest";

describe(getWorktreeItems, () => {
  test("skips the main checkout and names each linked worktree and each folder no worktree registers", () => {
    expect.hasAssertions();

    const porcelain =
      "worktree /main\nHEAD aaaaaaaaaaaaaaa\nbranch refs/heads/x\n\nworktree /main/.agents/worktrees/linked\nHEAD bbbbbbbbbbbbbbb\ndetached\n";

    expect(getWorktreeItems(porcelain, () => ["linked", "orphan"])).toStrictEqual([
      {
        action:
          "bash .agents/skills/throughput/scripts/remove-worktree.sh /main/.agents/worktrees/linked once nothing uses it",
        text: "/main/.agents/worktrees/linked bbbbbbbbbb",
      },
      {
        action:
          "bash .agents/skills/throughput/scripts/remove-worktree.sh /main/.agents/worktrees/orphan once nothing in it is wanted",
        text: "/main/.agents/worktrees/orphan no worktree registers it",
      },
    ]);
  });
});
