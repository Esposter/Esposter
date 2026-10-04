import { computeOtsuThreshold } from "#src/services/genshinAssets/shared/computeOtsuThreshold";
import { describe, expect, test } from "vitest";

describe(computeOtsuThreshold, () => {
  test("splits two tones between them", () => {
    expect.hasAssertions();

    const threshold = computeOtsuThreshold([
      ...Array.from({ length: 30 }, () => 140),
      ...Array.from({ length: 10 }, () => 152),
    ]);

    expect(threshold).toBeGreaterThanOrEqual(140);
    expect(threshold).toBeLessThan(152);
  });
});
