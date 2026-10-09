import type { FishingReel } from "#src/models/fishing/FishingReel";

import { FishingPhase } from "#src/models/fishing/FishingPhase";
import { REEL_LOST_OUT_OF_ZONE_SECONDS } from "#src/services/fishing/constants";
import { stepFishingReel } from "#src/services/fishing/stepFishingReel";
import { describe, expect, test } from "vitest";

describe(stepFishingReel, () => {
  const HP = 10;
  const SECONDS = 1;
  const TENSION = 0.5;
  const WHOLE_ZONE = { start: 0, width: 1 };
  const reel: FishingReel = { hp: HP, outOfZoneSeconds: 0, phase: FishingPhase.Reeling, tension: TENSION };

  test("a tension inside its zone wears the fish down by the attack, and the fish is caught at no hit points", () => {
    expect.hasAssertions();

    expect(stepFishingReel(reel, { attack: 4, isReeling: false, seconds: SECONDS, zone: WHOLE_ZONE }).hp).toBe(6);
    expect(stepFishingReel(reel, { attack: HP, isReeling: false, seconds: SECONDS, zone: WHOLE_ZONE }).phase).toBe(
      FishingPhase.Caught,
    );
  });

  test("a tension out of its zone wears nothing down, and the line breaks past its allowance out of the zone", () => {
    expect.hasAssertions();

    const outside = { start: 0.9, width: 0.05 };
    const stepped = stepFishingReel(reel, { attack: 4, isReeling: false, seconds: SECONDS, zone: outside });

    expect(stepped.hp).toBe(HP);
    expect(stepped.phase).toBe(FishingPhase.Reeling);
    expect(
      stepFishingReel(
        { ...reel, outOfZoneSeconds: REEL_LOST_OUT_OF_ZONE_SECONDS },
        { attack: 4, isReeling: false, seconds: SECONDS, zone: outside },
      ).phase,
    ).toBe(FishingPhase.Lost);
  });

  test("a caught or lost reel steps no further", () => {
    expect.hasAssertions();

    const caught = { ...reel, hp: 0, phase: FishingPhase.Caught };

    expect(stepFishingReel(caught, { attack: 4, isReeling: false, seconds: SECONDS, zone: WHOLE_ZONE })).toBe(caught);
  });
});
