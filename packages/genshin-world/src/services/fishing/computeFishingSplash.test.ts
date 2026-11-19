import type { FishingCast } from "#src/models/fishing/FishingCast";

import { FishingPhase } from "#src/models/fishing/FishingPhase";
import { computeFishingSplash } from "#src/services/fishing/computeFishingSplash";
import { FISHING_SPLASH_SECONDS } from "#src/services/fishing/constants";
import { describe, expect, test } from "vitest";

const createCast = (phase: FishingPhase, reelSeconds: number): Pick<FishingCast, "phase" | "reelSeconds"> => ({
  phase,
  reelSeconds,
});

describe(computeFishingSplash, () => {
  test("a struck bite shows a splash", () => {
    expect.hasAssertions();

    expect(computeFishingSplash(createCast(FishingPhase.Reeling, 0))).toStrictEqual({ age: 0 });
    expect(computeFishingSplash(createCast(FishingPhase.Reeling, FISHING_SPLASH_SECONDS))).toBeUndefined();
  });

  test("a strike with no bite shows no splash", () => {
    expect.hasAssertions();

    expect(computeFishingSplash(createCast(FishingPhase.Waiting, 0))).toBeUndefined();
    expect(computeFishingSplash(undefined)).toBeUndefined();
  });
});
