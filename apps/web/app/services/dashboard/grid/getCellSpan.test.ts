import { getCellSpan } from "@/services/dashboard/grid/getCellSpan";
import { describe, expect, test } from "vitest";

describe(getCellSpan, () => {
  test("counts the cells a size covers, and never fewer than one", () => {
    expect.hasAssertions();

    expect(getCellSpan(90, 50)).toBe(2);
    expect(getCellSpan(-200, 50)).toBe(1);
  });
});
