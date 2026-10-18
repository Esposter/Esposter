import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { changeKitCooldown } from "#src/services/kit/effects/changeKitCooldown";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { describe, expect, test } from "vitest";

describe(changeKitCooldown, () => {
  const ID = "cooldown";

  test("shortens a running cooldown by the seconds given, and ends it at zero, and leaves one that is not running alone", () => {
    expect.hasAssertions();
    const kitEffectState: KitEffectState = { effects: [] };
    addKitStatus(kitEffectState, TRAVELER_CHARACTER_ID, { id: ID, secondsRemaining: 10 });

    expect(changeKitCooldown(kitEffectState, TRAVELER_CHARACTER_ID, ID, -4)).toBe(true);
    expect(findKitStatus(kitEffectState.effects, TRAVELER_CHARACTER_ID, ID)?.secondsRemaining).toBe(6);

    expect(changeKitCooldown(kitEffectState, TRAVELER_CHARACTER_ID, ID, -20)).toBe(true);
    expect(findKitStatus(kitEffectState.effects, TRAVELER_CHARACTER_ID, ID)?.secondsRemaining).toBe(0);

    expect(changeKitCooldown(kitEffectState, TRAVELER_CHARACTER_ID, ID, -4)).toBe(false);
    expect(changeKitCooldown(kitEffectState, TRAVELER_CHARACTER_ID, "other", -4)).toBe(false);
  });
});
