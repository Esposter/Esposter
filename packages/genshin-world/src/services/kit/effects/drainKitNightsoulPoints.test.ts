import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { NIGHTSOUL_BLESSING_STATUS_ID, NIGHTSOUL_POINTS_ID } from "#src/services/kit/constants";
import { countKitResource } from "#src/services/kit/effects/countKitResource";
import { drainKitNightsoulPoints } from "#src/services/kit/effects/drainKitNightsoulPoints";
import { enterKitNightsoulBlessing } from "#src/services/kit/effects/enterKitNightsoulBlessing";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { describe, expect, test } from "vitest";

const CHARACTER_ID = 1;

describe(drainKitNightsoulPoints, () => {
  test("drains the points asked for, and no more than the character holds", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    enterKitNightsoulBlessing(kitEffectState, CHARACTER_ID, 10, Number.POSITIVE_INFINITY);
    expect(drainKitNightsoulPoints(kitEffectState, CHARACTER_ID, 4)).toBe(4);
    expect(countKitResource(kitEffectState.effects, CHARACTER_ID, NIGHTSOUL_POINTS_ID)).toBe(6);
    expect(drainKitNightsoulPoints(kitEffectState, CHARACTER_ID, 15)).toBe(6);
    expect(countKitResource(kitEffectState.effects, CHARACTER_ID, NIGHTSOUL_POINTS_ID)).toBe(0);
  });

  test("keeps the blessing when its points run out, for the kit to leave it", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    enterKitNightsoulBlessing(kitEffectState, CHARACTER_ID, 10, Number.POSITIVE_INFINITY);
    expect(drainKitNightsoulPoints(kitEffectState, CHARACTER_ID, 10)).toBe(10);
    expect(findKitStatus(kitEffectState.effects, CHARACTER_ID, NIGHTSOUL_BLESSING_STATUS_ID)).toBeDefined();
  });
});
