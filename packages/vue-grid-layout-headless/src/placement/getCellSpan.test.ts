import { getCellSpan } from "#src/placement/getCellSpan";
import { describe, expect, test } from "vitest";

describe(getCellSpan, () => {
  test("counts the cells a size covers, and never fewer than one", () => {
    expect.hasAssertions();

    expect(getCellSpan(90, 50, 10)).toBe(2);
    expect(getCellSpan(-1, 50, 10)).toBe(1);
  });
});
