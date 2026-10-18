import type { Fish } from "#src/models/fishing/Fish";

import { FishingPhase } from "#src/models/fishing/FishingPhase";
import { startFishingCast } from "#src/services/fishing/startFishingCast";
import { stepFishingCast } from "#src/services/fishing/stepFishingCast";
import { describe, expect, test } from "vitest";

describe(stepFishingCast, () => {
  const GEAR = { inSpeed: 5, outSpeed: 8 };
  const FISH = { biteTimeout: 4, hp: 4 } as Fish;
  const ROD = { attackAcc: 1, attackMag: 1, baseAttack: 4, cityId: 0, id: 1, maxAttack: 0 };
  const WHOLE_BAR_TRAVEL = { duration: 10, offset: 0, speed: 0, width: 100 };
  const NIBBLE_SECONDS = 2;
  const STEP = { isReeling: false, isStruck: false, seconds: 1 };
  const START = { fish: FISH, gear: GEAR, nibbleSeconds: NIBBLE_SECONDS, rod: ROD, travel: WHOLE_BAR_TRAVEL };

  test("a fish nibbles, then bites, and a strike on the bite starts the reel", () => {
    expect.hasAssertions();

    const cast = startFishingCast(START);
    const nibbling = stepFishingCast(cast, STEP);
    expect(nibbling.phase).toBe(FishingPhase.Waiting);

    const biting = stepFishingCast(nibbling, { ...STEP, seconds: 1 });
    expect(biting.phase).toBe(FishingPhase.Biting);
    expect(stepFishingCast(biting, { ...STEP, isStruck: true, seconds: 0 }).phase).toBe(FishingPhase.Reeling);
  });

  test("a strike while the fish nibbles scares it off back to aiming", () => {
    expect.hasAssertions();

    const cast = startFishingCast(START);

    expect(stepFishingCast(cast, { ...STEP, isStruck: true }).phase).toBe(FishingPhase.Aiming);
  });

  test("a reeled fish is caught once the rod wears its hit points down inside the zone", () => {
    expect.hasAssertions();

    const reeling = stepFishingCast(
      { ...startFishingCast({ ...START, nibbleSeconds: 0 }), phase: FishingPhase.Biting },
      { ...STEP, isStruck: true, seconds: 0 },
    );
    const caught = stepFishingCast(reeling, { ...STEP, isReeling: true });

    expect(caught.phase).toBe(FishingPhase.Caught);
    expect(caught.reelSeconds).toBe(1);
  });
});
