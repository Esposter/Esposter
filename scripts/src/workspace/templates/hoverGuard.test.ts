import { readUnattributedPressFindings } from "#src/services/sweeps/hoverGuard/readUnattributedPressFindings";
import { readUnguardedHoverFindings } from "#src/services/sweeps/hoverGuard/readUnguardedHoverFindings";
import { TREE_READ_TIMEOUT_MS } from "#src/workspace/constants.test";
import { describe, expect, test } from "vitest";

/**
 * The interface library's hover rule — a pointer's `:hover` look sits under `@media (hover: hover)`, so a touch
 * screen leaves nothing lit after a tap — held over every stylesheet of the two Genshin packages. A review had written
 * the same finding about twenty rules in one round, and nothing else sees it: the unguarded rule draws exactly as the
 * guarded one on a mouse, so no screenshot, type or unit test differs.
 */
describe("hoverGuard", () => {
  test(
    "no Genshin stylesheet lights a rule on hover outside the hover media query",
    { timeout: TREE_READ_TIMEOUT_MS },
    () => {
      expect.hasAssertions();

      expect(readUnguardedHoverFindings()).toStrictEqual([]);
    },
  );

  // The pad's confirm presses a focused button by setting `data-pressed` for the moment before its click, which draws
  // The press as `:active` does only where a rule names it
  test(
    "no Genshin stylesheet draws a press for the pointer's active state and not the pad's attribute",
    { timeout: TREE_READ_TIMEOUT_MS },
    () => {
      expect.hasAssertions();

      expect(readUnattributedPressFindings()).toStrictEqual([]);
    },
  );
});
