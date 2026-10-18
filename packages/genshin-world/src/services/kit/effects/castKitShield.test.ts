import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitEffect } from "#src/models/kit/KitEffect";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { castKitShield } from "#src/services/kit/effects/castKitShield";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { describe, expect, test, vi } from "vitest";

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

describe(castKitShield, () => {
  const OTHER_CHARACTER_ID = 1;

  test("a shield cast is told to every deployed member's kit once it stands", () => {
    expect.hasAssertions();

    const onKitEvent = vi.fn<NonNullable<Kit["onKitEvent"]>>();
    const combatant: Combatant = {
      ascension: 0,
      attributes: computeCharacterAttributes([]),
      characterId: TRAVELER_CHARACTER_ID,
      constellationCount: 0,
      elementalResonances: [],
      kit: { ...TRAVELER_KIT, onKitEvent },
      level: 1,
    };
    const context = createKitTestContext(combatant, {
      party: createParty([TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID]),
    });
    const effectsWhenTold: KitEffect[][] = [];
    onKitEvent.mockImplementation((_event, { kitEffectState }) => {
      effectsWhenTold.push(kitEffectState.effects);
    });
    const shield = castKitShield(context, OTHER_CHARACTER_ID, { health: 1, secondsRemaining: 10 });

    expect(onKitEvent).toHaveBeenCalledExactlyOnceWith({ kind: KitEventKind.ShieldCast, shield }, context, combatant);
    expect(effectsWhenTold).toStrictEqual([[shield]]);
  });
});
