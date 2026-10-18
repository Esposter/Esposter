import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { HAUNTED_NIGHT_STATUS_ID, NIGHTINGALE_SONG_STATUS_ID } from "#src/services/kit/constants";
import { countKitResource } from "#src/services/kit/effects/countKitResource";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { startKitHauntedNight } from "#src/services/kit/effects/startKitHauntedNight";
import { describe, expect, test } from "vitest";

const CHARACTER_ID = 1;
const OTHER_CHARACTER_ID = 2;

describe(startKitHauntedNight, () => {
  test("starts the state for its seconds, holding the stacks of Nightingale's Song it gains", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    startKitHauntedNight(kitEffectState, CHARACTER_ID, { secondsRemaining: 20, stacks: 21 });
    expect(findKitStatus(kitEffectState.effects, CHARACTER_ID, HAUNTED_NIGHT_STATUS_ID)?.secondsRemaining).toBe(20);
    expect(countKitResource(kitEffectState.effects, CHARACTER_ID, NIGHTINGALE_SONG_STATUS_ID)).toBe(21);
    expect(findKitStatus(kitEffectState.effects, CHARACTER_ID, NIGHTINGALE_SONG_STATUS_ID)?.secondsRemaining).toBe(20);
  });

  test("adds its stacks to those it holds, and starts the seconds over", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    startKitHauntedNight(kitEffectState, CHARACTER_ID, { secondsRemaining: 20, stacks: 21 });
    startKitHauntedNight(kitEffectState, CHARACTER_ID, { secondsRemaining: 15, stacks: 21 });
    expect(countKitResource(kitEffectState.effects, CHARACTER_ID, NIGHTINGALE_SONG_STATUS_ID)).toBe(42);
    expect(findKitStatus(kitEffectState.effects, CHARACTER_ID, HAUNTED_NIGHT_STATUS_ID)?.secondsRemaining).toBe(15);
    expect(findKitStatus(kitEffectState.effects, CHARACTER_ID, NIGHTINGALE_SONG_STATUS_ID)?.secondsRemaining).toBe(15);
  });

  test("leaves another character's state and its stacks as they were", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    startKitHauntedNight(kitEffectState, OTHER_CHARACTER_ID, { secondsRemaining: 20, stacks: 21 });
    startKitHauntedNight(kitEffectState, CHARACTER_ID, { secondsRemaining: 20, stacks: 21 });
    expect(countKitResource(kitEffectState.effects, OTHER_CHARACTER_ID, NIGHTINGALE_SONG_STATUS_ID)).toBe(21);
    expect(findKitStatus(kitEffectState.effects, OTHER_CHARACTER_ID, HAUNTED_NIGHT_STATUS_ID)?.secondsRemaining).toBe(
      20,
    );
  });
});
