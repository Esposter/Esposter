import { getRampRow } from "#src/character/shading/getRampRow";
import { describe, expect, test } from "vitest";

describe(getRampRow, () => {
  test("places the first row at 0.05 and each region after it a tenth on", () => {
    expect.hasAssertions();

    expect(getRampRow(1, false)).toBeCloseTo(0.05);
    expect(getRampRow(2, false)).toBeCloseTo(0.15);
    expect(getRampRow(5, false)).toBeCloseTo(0.45);
  });

  test("places the cool shadow's rows from 0.55, the same step on", () => {
    expect.hasAssertions();

    expect(getRampRow(1, true)).toBeCloseTo(0.55);
    expect(getRampRow(5, true)).toBeCloseTo(0.95);
  });
});
