import { readOtsuThreshold } from "#src/services/genshinAssets/shared/readOtsuThreshold";
import { describe, expect, test } from "vitest";

describe(readOtsuThreshold, () => {
  test("splits two tones between them", () => {
    expect.hasAssertions();

    const threshold = readOtsuThreshold([
      ...Array.from({ length: 30 }, () => 140),
      ...Array.from({ length: 10 }, () => 152),
    ]);

    expect(threshold).toBeGreaterThanOrEqual(140);
    expect(threshold).toBeLessThan(152);
  });
});
