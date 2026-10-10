import { getWorktreeItems } from "#src/services/resume/getWorktreeItems";
import { describe, expect, test } from "vitest";

describe(getWorktreeItems, () => {
  test("skips the main checkout and names each linked worktree", () => {
    expect.hasAssertions();

    const porcelain =
      "worktree /main\nHEAD aaaaaaaaaaaaaaa\nbranch refs/heads/x\n\nworktree /linked\nHEAD bbbbbbbbbbbbbbb\ndetached\n";

    expect(getWorktreeItems(porcelain)).toStrictEqual([
      {
        action: "bash .agents/skills/throughput/scripts/remove-worktree.sh /linked once nothing uses it",
        text: "/linked bbbbbbbbbb",
      },
    ]);
  });
});
