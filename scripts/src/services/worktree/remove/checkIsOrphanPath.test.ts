import { checkIsOrphanPath } from "#src/services/worktree/remove/checkIsOrphanPath";
import { describe, expect, test } from "vitest";

describe(checkIsOrphanPath, () => {
  test("accepts a folder inside the worktrees folder, on either separator, and refuses the main checkout", () => {
    expect.hasAssertions();

    expect(checkIsOrphanPath("/main/.agents/worktrees/orphan")).toBe(true);
    expect(checkIsOrphanPath(String.raw`C:\main\.agents\worktrees\orphan`)).toBe(true);
    expect(checkIsOrphanPath("/main")).toBe(false);
  });
});
