import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(startKitCooldown, () => {
  test("starts a cooldown unless one is still running, and again once it has run out, before the step drops it", () => {
    expect.hasAssertions();
    const kitEffectState: KitEffectState = { effects: [] };
    const start = (): boolean => startKitCooldown(kitEffectState, TRAVELER_CHARACTER_ID, "", 1);

    expect(start()).toBe(true);
    expect(start()).toBe(false);

    takeOne(kitEffectState.effects).secondsRemaining = 0;

    expect(start()).toBe(true);
    expect(takeOne(kitEffectState.effects).secondsRemaining).toBe(1);
  });
});
