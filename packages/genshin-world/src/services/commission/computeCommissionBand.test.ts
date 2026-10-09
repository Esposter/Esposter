import { computeCommissionBand } from "#src/services/commission/computeCommissionBand";
import { describe, expect, test } from "vitest";

describe(computeCommissionBand, () => {
  test("should place each five ranks in one band, from the first at rank one", () => {
    expect.hasAssertions();
    expect(computeCommissionBand(1)).toBe(0);
    expect(computeCommissionBand(5)).toBe(0);
    expect(computeCommissionBand(6)).toBe(1);
    expect(computeCommissionBand(60)).toBe(11);
  });

  test("should keep a rank past the last band's top in the last band", () => {
    expect.hasAssertions();
    expect(computeCommissionBand(99)).toBe(11);
  });
});
