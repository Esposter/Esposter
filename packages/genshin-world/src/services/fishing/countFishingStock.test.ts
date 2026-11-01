import { FISH_RESPAWN_DURATION } from "#src/services/fishing/constants";
import { countFishingStock } from "#src/services/fishing/countFishingStock";
import { describe, expect, test } from "vitest";

describe(countFishingStock, () => {
  const CAUGHT_AT = Temporal.Instant.fromEpochMilliseconds(0);
  const RESPAWNED_AT = CAUGHT_AT.add(FISH_RESPAWN_DURATION);

  test("a caught fish is back in its stock seventy-two hours after its catch, and not before", () => {
    expect.hasAssertions();

    expect(countFishingStock(1, [CAUGHT_AT], RESPAWNED_AT.subtract({ milliseconds: 1 }))).toBe(0);
    expect(countFishingStock(1, [CAUGHT_AT], RESPAWNED_AT)).toBe(1);
  });

  test("a stock refills fish by fish, each back once its own catch is seventy-two hours old", () => {
    expect.hasAssertions();

    const caughtAts = [CAUGHT_AT, CAUGHT_AT.add({ hours: 1 })];

    expect(countFishingStock(2, caughtAts, RESPAWNED_AT)).toBe(1);
    expect(countFishingStock(2, caughtAts, RESPAWNED_AT.add({ hours: 1 }))).toBe(2);
  });
});
