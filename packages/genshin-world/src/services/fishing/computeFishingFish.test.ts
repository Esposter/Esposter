import type { Fish } from "#src/models/fishing/Fish";
import type { FishingPointPlace } from "#src/models/fishing/FishingPointPlace";

import { FishingPhase } from "#src/models/fishing/FishingPhase";
import { computeFishingFish } from "#src/services/fishing/computeFishingFish";
import { computeFishStandIn } from "#src/services/fishing/computeFishStandIn";
import { describe, expect, test } from "vitest";

const createFish = (fishCateId?: number): Fish => ({
  attractRange: 0,
  biteTimeout: 0,
  bonusDuration: [],
  bonusOffset: [],
  bonusSpeed: [],
  bonusWidth: 0,
  feelerTimes: [],
  fishCateId,
  fleeRange: 0,
  hp: 1,
  id: 1,
  itemId: 1,
  monsterId: 1,
  proficientId: 1,
  rewardId: 1,
  skillId: [],
});

describe(computeFishingFish, () => {
  const CATEGORY_ID = 1;
  const point: FishingPointPlace = { id: "1", position: { x: 1, z: 2 } };

  test("a hooked fish is drawn at the lure", () => {
    expect.hasAssertions();

    expect(computeFishingFish({ cast: { fish: createFish(), phase: FishingPhase.Reeling }, point })).toStrictEqual({
      position: point.position,
      shape: computeFishStandIn(undefined),
    });
    expect(computeFishingFish({ cast: { fish: createFish(), phase: FishingPhase.Biting }, point })).toBeUndefined();
  });

  test("a fish with no codex model is drawn as its category's stand-in", () => {
    expect.hasAssertions();

    expect(
      computeFishingFish({ cast: { fish: createFish(CATEGORY_ID), phase: FishingPhase.Reeling }, point }),
    ).toStrictEqual({ position: point.position, shape: computeFishStandIn(CATEGORY_ID) });
  });
});
