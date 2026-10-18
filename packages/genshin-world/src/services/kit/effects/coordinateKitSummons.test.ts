import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitBody } from "#src/services/kit/createKitBody";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { coordinateKitSummons } from "#src/services/kit/effects/coordinateKitSummons";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { takeOne } from "@esposter/shared";
import { describe, expect, test, vi } from "vitest";

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

describe(coordinateKitSummons, () => {
  test("sets a coordinating summon going as the character on the field starts a normal attack, and on nothing else", () => {
    expect.hasAssertions();
    const combatant = {
      ascension: 0,
      attributes: computeCharacterAttributes([]),
      characterId: TRAVELER_CHARACTER_ID,
      constellationCount: 0,
      elementalResonances: [],
      kit: TRAVELER_KIT,
      level: 90,
    };
    const onNormalAttackStart = vi.fn<NonNullable<KitSummon["onNormalAttackStart"]>>();
    const kitEffectState: KitEffectState = {
      effects: [
        {
          body: createKitBody({ x: 0, z: 0 }),
          combatant,
          elapsedSeconds: 0,
          hits: [],
          kind: "summon",
          nextHitIndex: 0,
          onNormalAttackStart,
          secondsRemaining: 15,
        },
      ],
    };
    const context = createKitTestContext(combatant, { body: createKitBody({ x: 3, z: 4 }), kitEffectState });
    coordinateKitSummons(TRAVELER_KIT.elementalSkill, context);
    coordinateKitSummons(TRAVELER_KIT.chargedAttack, context);
    coordinateKitSummons(takeOne(TRAVELER_KIT.normalAttacks, 1), context);

    expect(onNormalAttackStart).toHaveBeenCalledExactlyOnceWith(context);
  });
});
