import type { HomePlant } from "#src/models/home/HomePlant";

import { checkIsHomeSeedGrown } from "#src/services/home/checkIsHomeSeedGrown";
import { describe, expect, test } from "vitest";

describe(checkIsHomeSeedGrown, () => {
  const EPOCH = Temporal.Instant.fromEpochMilliseconds(0);
  const SECONDS = 90;
  const plant: HomePlant = { fieldItemId: 372_501, seconds: SECONDS, seedItemId: 130_001 };

  test("a garden's seeds grow over real time", () => {
    expect.hasAssertions();

    expect(checkIsHomeSeedGrown(plant, EPOCH, EPOCH.add({ seconds: SECONDS - 1 }))).toBe(false);
    expect(checkIsHomeSeedGrown(plant, EPOCH, EPOCH.add({ seconds: SECONDS }))).toBe(true);
  });
});
