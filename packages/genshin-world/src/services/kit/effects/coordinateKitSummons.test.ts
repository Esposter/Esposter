import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitStepContext } from "#src/models/kit/KitStepContext";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createTravelerKit } from "#src/services/kit/characters/travelerKit";
import { coordinateKitSummons } from "#src/services/kit/effects/coordinateKitSummons";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { takeOne } from "@esposter/shared";
import { describe, expect, test, vi } from "vitest";

const TRAVELER_KIT = createTravelerKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [TRAVELER_CHARACTER_ID]));

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
    const onNormalAttackStart = vi.fn<(context: KitStepContext) => void>();
    const kitEffectState: KitEffectState = {
      effects: [
        {
          body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
          combatant,
          elapsedSeconds: 0,
          hits: [],
          kind: "summon",
          onNormalAttackStart,
          secondsRemaining: 15,
        },
      ],
    };
    const context = { body: { facing: 0, height: 0, position: { x: 3, z: 4 } }, combatant, kitEffectState };
    coordinateKitSummons(TRAVELER_KIT.elementalSkill, context);
    coordinateKitSummons(TRAVELER_KIT.chargedAttack, context);
    coordinateKitSummons(takeOne(TRAVELER_KIT.normalAttacks, 1), context);

    expect(onNormalAttackStart).toHaveBeenCalledExactlyOnceWith(context);
  });
});
