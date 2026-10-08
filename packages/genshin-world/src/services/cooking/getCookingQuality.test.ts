import type { CookingZones } from "#src/models/cooking/CookingZones";

import { CookingQuality } from "#src/models/cooking/CookingQuality";
import { getCookingQuality } from "#src/services/cooking/getCookingQuality";
import { describe, expect, test } from "vitest";

describe(getCookingQuality, () => {
  const zones: CookingZones = { delicious: [0.4, 0.6], regular: [0.3, 0.7] };

  test("should make a Delicious dish where the indicator stops in the delicious zone, its edges included", () => {
    expect.hasAssertions();

    expect(getCookingQuality(0.4, zones)).toBe(CookingQuality.Delicious);
    expect(getCookingQuality(0.6, zones)).toBe(CookingQuality.Delicious);
  });

  test("should make a Regular dish where it stops in the regular zone but outside the delicious one", () => {
    expect.hasAssertions();

    expect(getCookingQuality(0.35, zones)).toBe(CookingQuality.Regular);
    expect(getCookingQuality(0.65, zones)).toBe(CookingQuality.Regular);
  });

  test("should make a Suspicious dish where it stops outside both zones", () => {
    expect.hasAssertions();

    expect(getCookingQuality(0.2, zones)).toBe(CookingQuality.Suspicious);
  });
});
