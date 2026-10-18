import { computeHiddenTransPointIds } from "#src/services/transPoint/computeHiddenTransPointIds";
import { describe, expect, test } from "vitest";

describe(computeHiddenTransPointIds, () => {
  test("a listed point a step names stays hidden until that step is reached", () => {
    expect.hasAssertions();

    expect(computeHiddenTransPointIds([9], new Set(["9"]), new Set())).toStrictEqual(new Set([9]));
  });

  test("a listed point no step names is shown", () => {
    expect.hasAssertions();

    expect(computeHiddenTransPointIds([9], new Set(), new Set())).toStrictEqual(new Set());
  });

  test("a listed point whose naming step is reached is shown", () => {
    expect.hasAssertions();

    expect(computeHiddenTransPointIds([9], new Set(["9"]), new Set(["9"]))).toStrictEqual(new Set());
  });
});
