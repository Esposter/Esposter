import { getBreakpointColumnNumber } from "@/services/dashboard/grid/getBreakpointColumnNumber";
import { describe, expect, test } from "vitest";

describe(getBreakpointColumnNumber, () => {
  test.each([
    [1200, 12],
    [1199, 10],
    [996, 10],
    [479, 2],
    [0, 2],
  ])("takes the columns of the widest breakpoint a %i pixel width reaches, %i", (width, columnNumber) => {
    expect.hasAssertions();

    expect(getBreakpointColumnNumber(width)).toBe(columnNumber);
  });
});
