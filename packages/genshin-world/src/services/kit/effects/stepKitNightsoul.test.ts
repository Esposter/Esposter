import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { NIGHTSOUL_BLESSING_STATUS_ID, NIGHTSOUL_POINTS_ID } from "#src/services/kit/constants";
import { countKitResource } from "#src/services/kit/effects/countKitResource";
import { enterKitNightsoulBlessing } from "#src/services/kit/effects/enterKitNightsoulBlessing";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { stepKitNightsoul } from "#src/services/kit/effects/stepKitNightsoul";
import { describe, expect, test } from "vitest";

const CHARACTER_ID = 1;

describe(stepKitNightsoul, () => {
  test("drains a blessing's points by its rate, and ends the blessing when they run out", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    enterKitNightsoulBlessing(kitEffectState, CHARACTER_ID, {
      nightsoulRate: { maximum: 80, perSecond: -8 },
      points: 10,
      secondsRemaining: Number.POSITIVE_INFINITY,
    });
    stepKitNightsoul(1, kitEffectState);
    expect(countKitResource(kitEffectState.effects, CHARACTER_ID, NIGHTSOUL_POINTS_ID)).toBe(2);
    stepKitNightsoul(1, kitEffectState);
    expect(countKitResource(kitEffectState.effects, CHARACTER_ID, NIGHTSOUL_POINTS_ID)).toBe(0);
    expect(findKitStatus(kitEffectState.effects, CHARACTER_ID, NIGHTSOUL_BLESSING_STATUS_ID)).toBeUndefined();
  });

  test("gains a blessing's points by its rate up to its maximum, and keeps the blessing", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    enterKitNightsoulBlessing(kitEffectState, CHARACTER_ID, {
      nightsoulRate: { maximum: 20, perSecond: 2 },
      points: 0,
      secondsRemaining: 10,
    });
    stepKitNightsoul(5, kitEffectState);
    expect(countKitResource(kitEffectState.effects, CHARACTER_ID, NIGHTSOUL_POINTS_ID)).toBe(10);
    stepKitNightsoul(10, kitEffectState);
    expect(countKitResource(kitEffectState.effects, CHARACTER_ID, NIGHTSOUL_POINTS_ID)).toBe(20);
    expect(findKitStatus(kitEffectState.effects, CHARACTER_ID, NIGHTSOUL_BLESSING_STATUS_ID)).toBeDefined();
  });

  test("leaves a blessing with no rate as its points are, and drops the points of a blessing that has ended", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    enterKitNightsoulBlessing(kitEffectState, CHARACTER_ID, { points: 30, secondsRemaining: 10 });
    stepKitNightsoul(5, kitEffectState);
    expect(countKitResource(kitEffectState.effects, CHARACTER_ID, NIGHTSOUL_POINTS_ID)).toBe(30);
    kitEffectState.effects = kitEffectState.effects.filter(
      (effect) => effect.kind !== "status" || effect.id !== NIGHTSOUL_BLESSING_STATUS_ID,
    );
    stepKitNightsoul(1, kitEffectState);
    expect(countKitResource(kitEffectState.effects, CHARACTER_ID, NIGHTSOUL_POINTS_ID)).toBe(0);
  });

  test("reports the points a blessing drains over a step as consumed, and none for a blessing that gains", () => {
    expect.hasAssertions();

    const drainingState: KitEffectState = { effects: [] };
    enterKitNightsoulBlessing(drainingState, CHARACTER_ID, {
      nightsoulRate: { maximum: 80, perSecond: -8 },
      points: 10,
      secondsRemaining: Number.POSITIVE_INFINITY,
    });
    expect(stepKitNightsoul(1, drainingState)).toStrictEqual([
      { characterId: CHARACTER_ID, kind: KitEventKind.NightsoulPointsConsumed, points: 8 },
    ]);

    const gainingState: KitEffectState = { effects: [] };
    enterKitNightsoulBlessing(gainingState, CHARACTER_ID, {
      nightsoulRate: { maximum: 20, perSecond: 2 },
      points: 0,
      secondsRemaining: 10,
    });
    expect(stepKitNightsoul(1, gainingState)).toStrictEqual([]);
  });
});
