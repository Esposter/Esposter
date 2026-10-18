import type { FishingReel } from "#src/models/fishing/FishingReel";

import { FishingPhase } from "#src/models/fishing/FishingPhase";
import { REEL_BAR_MAX, REEL_LOST_OUT_OF_ZONE_SECONDS } from "#src/services/fishing/constants";
import { stepFishingReel } from "#src/services/fishing/stepFishingReel";
import { describe, expect, test } from "vitest";

describe(stepFishingReel, () => {
  const GEAR = { inSpeed: 5, outSpeed: 8 };
  const HP = 10;
  const SECONDS = 1;
  const TENSION = REEL_BAR_MAX / 2;
  const WHOLE_ZONE = { start: 0, width: REEL_BAR_MAX };
  const OUTSIDE_ZONE = { start: 90, width: 5 };
  const reel: FishingReel = { hp: HP, outOfZoneSeconds: 0, phase: FishingPhase.Reeling, tension: TENSION };

  test("a tension inside its zone wears the fish down by the attack, and the fish is caught at no hit points", () => {
    expect.hasAssertions();

    expect(
      stepFishingReel(reel, { attack: 4, gear: GEAR, isReeling: false, seconds: SECONDS, zone: WHOLE_ZONE }).hp,
    ).toBe(6);
    expect(
      stepFishingReel(reel, { attack: HP, gear: GEAR, isReeling: false, seconds: SECONDS, zone: WHOLE_ZONE }).phase,
    ).toBe(FishingPhase.Caught);
  });

  test("a tension out of its zone wears nothing down", () => {
    expect.hasAssertions();

    const stepped = stepFishingReel(reel, {
      attack: 4,
      gear: GEAR,
      isReeling: false,
      seconds: SECONDS,
      zone: OUTSIDE_ZONE,
    });

    expect(stepped.hp).toBe(HP);
    expect(stepped.phase).toBe(FishingPhase.Reeling);
  });

  test("the tension moves at the gear's inside speed inside its zone and its outside speed outside it", () => {
    expect.hasAssertions();

    expect(
      stepFishingReel(reel, { attack: 0, gear: GEAR, isReeling: true, seconds: SECONDS, zone: WHOLE_ZONE }).tension,
    ).toBe(TENSION + GEAR.inSpeed);
    expect(
      stepFishingReel(reel, { attack: 0, gear: GEAR, isReeling: false, seconds: SECONDS, zone: OUTSIDE_ZONE }).tension,
    ).toBe(TENSION - GEAR.outSpeed);
  });

  test("the line breaks after too long out of the zone", () => {
    expect.hasAssertions();

    expect(
      stepFishingReel(
        { ...reel, outOfZoneSeconds: REEL_LOST_OUT_OF_ZONE_SECONDS },
        { attack: 4, gear: GEAR, isReeling: false, seconds: SECONDS, zone: OUTSIDE_ZONE },
      ).phase,
    ).toBe(FishingPhase.Lost);
  });

  test("a caught or lost reel steps no further", () => {
    expect.hasAssertions();

    const caught = { ...reel, hp: 0, phase: FishingPhase.Caught };

    expect(
      stepFishingReel(caught, { attack: 4, gear: GEAR, isReeling: false, seconds: SECONDS, zone: WHOLE_ZONE }),
    ).toBe(caught);
  });
});
