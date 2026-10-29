import { KIBIBYTE } from "#src/services/constants";
import { getSizeBand } from "#src/services/getSizeBand";
import { describe, expect, test } from "vitest";

describe(getSizeBand, () => {
  // A bundle of seventy kibibytes, the size most of the packages' bundles are near
  const bytes = 70 * KIBIBYTE;

  test("a size that grows a few percent stays in its band", () => {
    expect.hasAssertions();

    expect(getSizeBand(bytes * 1.03)).toBe(getSizeBand(bytes));
  });

  test("a size that doubles leaves its band", () => {
    expect.hasAssertions();

    expect(getSizeBand(bytes * 2)).toBeGreaterThan(getSizeBand(bytes));
  });

  test("the band sits at least a tenth above the size", () => {
    expect.hasAssertions();

    expect(getSizeBand(bytes) * KIBIBYTE).toBeGreaterThanOrEqual(bytes * 1.1);
  });
});
