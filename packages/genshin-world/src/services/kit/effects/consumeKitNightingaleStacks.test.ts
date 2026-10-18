import type { KitEffectState } from "#src/models/kit/KitEffectState";

import {
  HAUNTED_NIGHT_STATUS_ID,
  NIGHTINGALE_SONG_EXTRA_STATUS_ID,
  NIGHTINGALE_SONG_STATUS_ID,
} from "#src/services/kit/constants";
import { consumeKitNightingaleStacks } from "#src/services/kit/effects/consumeKitNightingaleStacks";
import { countKitResource } from "#src/services/kit/effects/countKitResource";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { gainKitNightingaleStacks } from "#src/services/kit/effects/gainKitNightingaleStacks";
import { startKitHauntedNight } from "#src/services/kit/effects/startKitHauntedNight";
import { describe, expect, test } from "vitest";

const CHARACTER_ID = 1;

describe(consumeKitNightingaleStacks, () => {
  test("consumes one stack per opponent hit, and returns how many it consumed", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    startKitHauntedNight(kitEffectState, CHARACTER_ID, { secondsRemaining: 20, stacks: 21 });
    expect(consumeKitNightingaleStacks(kitEffectState, CHARACTER_ID, 2)).toBe(2);
    expect(countKitResource(kitEffectState.effects, CHARACTER_ID, NIGHTINGALE_SONG_STATUS_ID)).toBe(19);
  });

  test("consumes no more than it holds, and ends the state when none is left", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    startKitHauntedNight(kitEffectState, CHARACTER_ID, { secondsRemaining: 20, stacks: 3 });
    gainKitNightingaleStacks(kitEffectState, CHARACTER_ID, {
      constructCount: 1,
      maximumExtraStacks: 15,
      stacksPerConstruct: 5,
    });
    expect(consumeKitNightingaleStacks(kitEffectState, CHARACTER_ID, 10)).toBe(8);
    expect(findKitStatus(kitEffectState.effects, CHARACTER_ID, HAUNTED_NIGHT_STATUS_ID)).toBeUndefined();
    expect(findKitStatus(kitEffectState.effects, CHARACTER_ID, NIGHTINGALE_SONG_EXTRA_STATUS_ID)).toBeUndefined();
    expect(countKitResource(kitEffectState.effects, CHARACTER_ID, NIGHTINGALE_SONG_STATUS_ID)).toBe(0);
  });

  test("keeps the seconds the state has left on its stacks as they are consumed", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    startKitHauntedNight(kitEffectState, CHARACTER_ID, { secondsRemaining: 12, stacks: 21 });
    consumeKitNightingaleStacks(kitEffectState, CHARACTER_ID, 2);
    expect(findKitStatus(kitEffectState.effects, CHARACTER_ID, NIGHTINGALE_SONG_STATUS_ID)?.secondsRemaining).toBe(12);
  });

  test("consumes nothing while the character holds no state", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    expect(consumeKitNightingaleStacks(kitEffectState, CHARACTER_ID, 1)).toBe(0);
    expect(kitEffectState.effects).toStrictEqual([]);
  });
});
