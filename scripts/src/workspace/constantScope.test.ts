import { readConstantScopeFindings } from "#src/services/sweeps/constantScope/readConstantScopeFindings";
import { describe, expect, test } from "vitest";

/**
 * The `testing` skill's scope rule — a constant lives inside the `describe` that reads it, never at module scope
 * where a sibling suite can reach and mutate it — held over every suite in the repository. The scan is the
 * `ai:sweep:constant-scope` pass's own, which knows every shape that cannot move in — a function, a hoisted
 * block, a top-level await, and whatever one of those reads — so a clean repository is an empty list rather than
 * a known one, and this is what keeps it empty.
 */
describe("constantScope", () => {
  test("no suite declares a constant at module scope that a describe could hold", () => {
    expect.hasAssertions();

    expect(readConstantScopeFindings()).toStrictEqual([]);
  });
});
