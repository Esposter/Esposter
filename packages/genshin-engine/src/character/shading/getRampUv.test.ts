import { getRampUv } from "#src/character/shading/getRampUv";
import { RampLayout } from "#src/models/character/RampLayout";
import { describe, expect, test } from "vitest";

describe(getRampUv, () => {
  test("reads a horizontal ramp across its column and down from its row read bottom up", () => {
    expect.hasAssertions();

    expect(getRampUv(RampLayout.Horizontal, 0.25, 0.05)).toStrictEqual([0.25, 0.95]);
  });

  test("reads a vertical ramp up its column, the row not applying to a single column", () => {
    expect.hasAssertions();

    expect(getRampUv(RampLayout.Vertical, 1, 0.05)).toStrictEqual([0.5, 1]);
    expect(getRampUv(RampLayout.Vertical, 0, 0.45)).toStrictEqual([0.5, 0]);
  });
});
