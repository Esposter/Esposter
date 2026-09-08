import { createColor } from "#scripts/outdatedDependencies/createColor";
import { getVisibleLength } from "#scripts/outdatedDependencies/getVisibleLength";
import { describe, expect, test } from "vitest";

describe(getVisibleLength, () => {
  const color = createColor(true);

  test("counts plain characters", () => {
    expect.hasAssertions();

    expect(getVisibleLength("ab")).toBe(2);
  });

  test("ignores ANSI color escape sequences", () => {
    expect.hasAssertions();

    expect(getVisibleLength(color.red("ab"))).toBe(2);
  });
});
