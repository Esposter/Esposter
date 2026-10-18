import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { addKitSwapLock } from "#src/services/kit/effects/addKitSwapLock";
import { checkIsKitSwapBlocked } from "#src/services/kit/effects/checkIsKitSwapBlocked";
import { endKitStance } from "#src/services/kit/effects/endKitStance";
import { describe, expect, test } from "vitest";

describe(endKitStance, () => {
  test("ends the swap lock its character holds, and leaves the lock another character holds standing", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    addKitSwapLock(kitEffectState, 1, 5);
    addKitSwapLock(kitEffectState, 2, 5);
    endKitStance(kitEffectState.effects, 1);

    const blocked = [1, 2].map((characterId) => checkIsKitSwapBlocked(kitEffectState.effects, characterId));

    expect(blocked).toStrictEqual([false, true]);
  });
});
