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
    enterKitNightsoulBlessing(kitEffectState, CHARACTER_ID, 60, 10);
    enterKitNightsoulBlessing(kitEffectState, CHARACTER_ID, 20, 10);
    expect(countKitResource(kitEffectState.effects, CHARACTER_ID, NIGHTSOUL_POINTS_ID)).toBe(20);
    expect(findKitStatus(kitEffectState.effects, CHARACTER_ID, NIGHTSOUL_BLESSING_STATUS_ID)?.secondsRemaining).toBe(
      10,
    );
  });

  test("exits the blessing and drops its points, leaving another character's blessing and points as they were", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    enterKitNightsoulBlessing(kitEffectState, CHARACTER_ID, 60, Number.POSITIVE_INFINITY);
    enterKitNightsoulBlessing(kitEffectState, OTHER_CHARACTER_ID, 30, Number.POSITIVE_INFINITY);
    exitKitNightsoulBlessing(kitEffectState, CHARACTER_ID);
    expect(findKitStatus(kitEffectState.effects, CHARACTER_ID, NIGHTSOUL_BLESSING_STATUS_ID)).toBeUndefined();
    expect(countKitResource(kitEffectState.effects, CHARACTER_ID, NIGHTSOUL_POINTS_ID)).toBe(0);
    expect(countKitResource(kitEffectState.effects, OTHER_CHARACTER_ID, NIGHTSOUL_POINTS_ID)).toBe(30);
    expect(findKitStatus(kitEffectState.effects, OTHER_CHARACTER_ID, NIGHTSOUL_BLESSING_STATUS_ID)).toBeDefined();
  });
});
