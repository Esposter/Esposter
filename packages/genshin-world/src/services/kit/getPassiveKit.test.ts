import type { Combatant } from "#src/models/kit/Combatant";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { getPassiveKit } from "#src/services/kit/getPassiveKit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { describe, expect, test } from "vitest";

const KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

describe(getPassiveKit, () => {
  const combatant: Combatant = {
    ascension: 0,
    attributes: computeCharacterAttributes([]),
    characterId: TRAVELER_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: KIT,
    level: 1,
  };
  const context = createKitTestContext(combatant);

  test("multiplies the charged attack stamina factor of the kit by each module's, and leaves it at one with none", () => {
    expect.hasAssertions();

    const halvingKit = { ...KIT, getChargedAttackStaminaMultiplier: () => 0.5 };
    const halvingModule: PassiveModule = { getChargedAttackStaminaMultiplier: () => 0.5 };
    const freeModule: PassiveModule = { getChargedAttackStaminaMultiplier: () => 0 };

    expect(getPassiveKit(halvingKit, [halvingModule, freeModule]).getChargedAttackStaminaMultiplier?.(context)).toBe(0);
    expect(getPassiveKit(halvingKit, [halvingModule]).getChargedAttackStaminaMultiplier?.(context)).toBe(0.25);
    expect(getPassiveKit(KIT, []).getChargedAttackStaminaMultiplier?.(context)).toBe(1);
  });

  test("steps the kit's own clock and then each module's, with the member's combatant and the step's seconds", () => {
    expect.hasAssertions();

    const steps: string[] = [];
    const steppingKit = { ...KIT, onStep: () => steps.push("kit") };
    const steppingModule: PassiveModule = {
      onStep: (_context, { characterId }, stepSeconds) => {
        steps.push(`module ${characterId} ${stepSeconds}`);
      },
    };
    getPassiveKit(steppingKit, [steppingModule]).onStep?.(context, combatant, 0.5);

    expect(steps).toStrictEqual(["kit", `module ${TRAVELER_CHARACTER_ID} 0.5`]);
  });
});
