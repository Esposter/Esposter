import { getNextQualityTier } from "@/services/visual/globe/getNextQualityTier";
import { GlobeConfiguration } from "@/services/visual/GlobeConfiguration";
import { describe, expect, test } from "vitest";

const { qualityTiers, sampleCount, targetFps } = GlobeConfiguration;
describe(getNextQualityTier, () => {
  const slowFrame = 1000 / (targetFps - 10);
  const fastFrame = 1000 / (targetFps + 10);

  test("a slow run lowers the tier", () => {
    expect.hasAssertions();

    expect(
      getNextQualityTier(
        Array.from({ length: sampleCount }, () => slowFrame),
        0,
      ),
    ).toBe(1);
  });

  test("a fast run keeps the tier", () => {
    expect.hasAssertions();

    expect(
      getNextQualityTier(
        Array.from({ length: sampleCount }, () => fastFrame),
        0,
      ),
    ).toBe(0);
  });

  test("too few frames keep the tier", () => {
    expect.hasAssertions();

    expect(
      getNextQualityTier(
        Array.from({ length: sampleCount - 1 }, () => slowFrame),
        0,
      ),
    ).toBe(0);
  });

  test("the lowest tier stays", () => {
    expect.hasAssertions();

    const lowest = qualityTiers.length - 1;

    expect(
      getNextQualityTier(
        Array.from({ length: sampleCount }, () => slowFrame),
        lowest,
      ),
    ).toBe(lowest);
  });
});
