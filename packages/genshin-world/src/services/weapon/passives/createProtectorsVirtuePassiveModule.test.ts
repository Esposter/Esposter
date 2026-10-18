import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createProtectorsVirtuePassiveModule } from "#src/services/weapon/passives/createProtectorsVirtuePassiveModule";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

describe(createProtectorsVirtuePassiveModule, () => {
  // Protector's Virtue at its first rank: twenty per cent HP, and an ATK bonus of 1.2% of Max HP
  const protectorsVirtuePassiveModule = createProtectorsVirtuePassiveModule([0.2, 0.012]);
  const wielder: Combatant = {
    ascension: 0,
    attributes: computeCharacterAttributes([{ attribute: Attribute.Health, value: 10000 }]),
    characterId: TRAVELER_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: TRAVELER_KIT,
    level: 1,
  };

  test("the rank's share raises the wielder's HP, and its ATK bonus is the rank's share of its Max HP", () => {
    expect.hasAssertions();

    expect(protectorsVirtuePassiveModule.getPassiveBonuses?.(wielder, 1, [], [])).toStrictEqual([
      { amount: 0.2, attribute: Attribute.HealthPercent },
      { amount: 0.012 * 10000, attribute: Attribute.Attack },
    ]);
  });
});
