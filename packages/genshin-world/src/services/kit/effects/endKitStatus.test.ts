import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { endKitStatus } from "#src/services/kit/effects/endKitStatus";
import { describe, expect, test } from "vitest";

describe(endKitStatus, () => {
  test("ends the status of the id the character carries, leaving another character's and another id's", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = {
      effects: [
        { characterId: 1, id: "mark", kind: "status", secondsRemaining: 5 },
        { characterId: 2, id: "mark", kind: "status", secondsRemaining: 5 },
        { characterId: 1, id: "other", kind: "status", secondsRemaining: 5 },
      ],
    };
    endKitStatus(kitEffectState, 1, "mark");

    expect(kitEffectState.effects.map(({ secondsRemaining }) => secondsRemaining)).toStrictEqual([0, 5, 5]);
  });
});
