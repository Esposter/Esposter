import { getRampColumn } from "#src/character/shading/getRampColumn";
import { describe, expect, test } from "vitest";

describe(getRampColumn, () => {
  test("reads the ramp's right end where the threshold reaches the light area", () => {
    expect.hasAssertions();

    expect(getRampColumn(1, 1, 0.5)).toBe(1);
  });

  test("reads the left end where the threshold falls a band short of the light area", () => {
    expect.hasAssertions();

    expect(getRampColumn(0, 1, 0.5)).toBe(0);
  });

  test("reads the threshold a quarter of the way into the band as its middle column", () => {
    expect.hasAssertions();

    // X = (1 - 0.75) / 1 / 0.5 = 0.5, so u = 1 - x
    expect(getRampColumn(0.75, 1, 0.5)).toBeCloseTo(0.5);
  });
});
