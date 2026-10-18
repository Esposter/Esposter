import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { NIGHTINGALE_SONG_STATUS_ID } from "#src/services/kit/constants";
import { countKitResource } from "#src/services/kit/effects/countKitResource";
import { gainKitNightingaleStacks } from "#src/services/kit/effects/gainKitNightingaleStacks";
import { startKitHauntedNight } from "#src/services/kit/effects/startKitHauntedNight";
import { describe, expect, test } from "vitest";

const CHARACTER_ID = 1;
const OPTIONS = { maximumExtraStacks: 15, stacksPerConstruct: 5 };

describe(gainKitNightingaleStacks, () => {
  test("gains its stacks for each Geo Construct on the battlefield while the state holds", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    startKitHauntedNight(kitEffectState, CHARACTER_ID, { secondsRemaining: 20, stacks: 21 });
    expect(gainKitNightingaleStacks(kitEffectState, CHARACTER_ID, { ...OPTIONS, constructCount: 2 })).toBe(10);
    expect(countKitResource(kitEffectState.effects, CHARACTER_ID, NIGHTINGALE_SONG_STATUS_ID)).toBe(31);
  });

  test("caps what it gains within one state at its maximum extra stacks, however many constructs there are", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    startKitHauntedNight(kitEffectState, CHARACTER_ID, { secondsRemaining: 20, stacks: 21 });
    expect(gainKitNightingaleStacks(kitEffectState, CHARACTER_ID, { ...OPTIONS, constructCount: 2 })).toBe(10);
    expect(gainKitNightingaleStacks(kitEffectState, CHARACTER_ID, { ...OPTIONS, constructCount: 2 })).toBe(5);
    expect(gainKitNightingaleStacks(kitEffectState, CHARACTER_ID, { ...OPTIONS, constructCount: 3 })).toBe(0);
    expect(countKitResource(kitEffectState.effects, CHARACTER_ID, NIGHTINGALE_SONG_STATUS_ID)).toBe(36);
  });

  test("renews the cap when the state is started again", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    startKitHauntedNight(kitEffectState, CHARACTER_ID, { secondsRemaining: 20, stacks: 21 });
    gainKitNightingaleStacks(kitEffectState, CHARACTER_ID, { ...OPTIONS, constructCount: 3 });
    startKitHauntedNight(kitEffectState, CHARACTER_ID, { secondsRemaining: 20, stacks: 21 });
    expect(gainKitNightingaleStacks(kitEffectState, CHARACTER_ID, { ...OPTIONS, constructCount: 3 })).toBe(15);
  });

  test("gains none while the character holds no state", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    expect(gainKitNightingaleStacks(kitEffectState, CHARACTER_ID, { ...OPTIONS, constructCount: 2 })).toBe(0);
    expect(countKitResource(kitEffectState.effects, CHARACTER_ID, NIGHTINGALE_SONG_STATUS_ID)).toBe(0);
  });
});
