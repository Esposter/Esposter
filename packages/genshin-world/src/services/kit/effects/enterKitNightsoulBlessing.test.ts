import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { NIGHTSOUL_BLESSING_STATUS_ID, NIGHTSOUL_POINTS_ID } from "#src/services/kit/constants";
import { countKitResource } from "#src/services/kit/effects/countKitResource";
import { enterKitNightsoulBlessing } from "#src/services/kit/effects/enterKitNightsoulBlessing";
import { exitKitNightsoulBlessing } from "#src/services/kit/effects/exitKitNightsoulBlessing";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { describe, expect, test } from "vitest";

const CHARACTER_ID = 1;
const OTHER_CHARACTER_ID = 2;

describe(enterKitNightsoulBlessing, () => {
  test("enters the blessing with the points it starts with, in place of the points it held", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    enterKitNightsoulBlessing(kitEffectState, CHARACTER_ID, { points: 60, secondsRemaining: 10 });
    enterKitNightsoulBlessing(kitEffectState, CHARACTER_ID, { points: 20, secondsRemaining: 10 });
    expect(countKitResource(kitEffectState.effects, CHARACTER_ID, NIGHTSOUL_POINTS_ID)).toBe(20);
    expect(findKitStatus(kitEffectState.effects, CHARACTER_ID, NIGHTSOUL_BLESSING_STATUS_ID)?.secondsRemaining).toBe(
      10,
    );
  });

  test("keeps the rate the blessing runs on, and holds none when it has none", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    const nightsoulRate = { maximum: 80, perSecond: -8 };
    enterKitNightsoulBlessing(kitEffectState, CHARACTER_ID, {
      nightsoulRate,
      points: 80,
      secondsRemaining: Number.POSITIVE_INFINITY,
    });
    expect(
      findKitStatus(kitEffectState.effects, CHARACTER_ID, NIGHTSOUL_BLESSING_STATUS_ID)?.nightsoulRate,
    ).toStrictEqual(nightsoulRate);
    enterKitNightsoulBlessing(kitEffectState, OTHER_CHARACTER_ID, { points: 0, secondsRemaining: 10 });
    expect(
      findKitStatus(kitEffectState.effects, OTHER_CHARACTER_ID, NIGHTSOUL_BLESSING_STATUS_ID)?.nightsoulRate,
    ).toBeUndefined();
  });

  test("exits the blessing and drops its points, leaving another character's blessing and points as they were", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    enterKitNightsoulBlessing(kitEffectState, CHARACTER_ID, { points: 60, secondsRemaining: Number.POSITIVE_INFINITY });
    enterKitNightsoulBlessing(kitEffectState, OTHER_CHARACTER_ID, {
      points: 30,
      secondsRemaining: Number.POSITIVE_INFINITY,
    });
    exitKitNightsoulBlessing(kitEffectState, CHARACTER_ID);
    expect(findKitStatus(kitEffectState.effects, CHARACTER_ID, NIGHTSOUL_BLESSING_STATUS_ID)).toBeUndefined();
    expect(countKitResource(kitEffectState.effects, CHARACTER_ID, NIGHTSOUL_POINTS_ID)).toBe(0);
    expect(countKitResource(kitEffectState.effects, OTHER_CHARACTER_ID, NIGHTSOUL_POINTS_ID)).toBe(30);
    expect(findKitStatus(kitEffectState.effects, OTHER_CHARACTER_ID, NIGHTSOUL_BLESSING_STATUS_ID)).toBeDefined();
  });
});
