import { resolveCheckoutRoot } from "#src/services/format/resolveCheckoutRoot";
import { AGENT_WORKTREES_DIRECTORY } from "@esposter/configuration";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

describe(resolveCheckoutRoot, () => {
  const MAIN_CHECKOUT_ROOT = join("checkouts", "main");
  const WORKTREE_ROOT = join(MAIN_CHECKOUT_ROOT, AGENT_WORKTREES_DIRECTORY, "tooling-friction");

  test("a file in a worktree belongs to that worktree, however deep it sits", () => {
    expect.hasAssertions();

    expect(resolveCheckoutRoot(join(WORKTREE_ROOT, "scripts", "src", "format.ts"), MAIN_CHECKOUT_ROOT)).toBe(
      WORKTREE_ROOT,
    );
  });

  test("a file in the main checkout belongs to the main checkout", () => {
    expect.hasAssertions();

    expect(resolveCheckoutRoot(join(MAIN_CHECKOUT_ROOT, "scripts", "src", "format.ts"), MAIN_CHECKOUT_ROOT)).toBe(
      MAIN_CHECKOUT_ROOT,
    );
  });

  test("a file in the agent tree beside the worktrees folder belongs to the main checkout", () => {
    expect.hasAssertions();

    expect(
      resolveCheckoutRoot(join(MAIN_CHECKOUT_ROOT, AGENT_WORKTREES_DIRECTORY, "notes.md"), MAIN_CHECKOUT_ROOT),
    ).toBe(MAIN_CHECKOUT_ROOT);
  });
});
