import { getColumnWidth } from "@/services/dashboard/grid/getColumnWidth";
import { describe, expect, test } from "vitest";

describe(getColumnWidth, () => {
  test("shares the width among the columns, less a margin around each", () => {
    expect.hasAssertions();

    expect(getColumnWidth(110, 2)).toBe(40);
  });
});
