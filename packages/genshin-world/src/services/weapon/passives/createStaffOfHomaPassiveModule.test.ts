import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createStaffOfHomaPassiveModule } from "#src/services/weapon/passives/createStaffOfHomaPassiveModule";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

describe(createStaffOfHomaPassiveModule, () => {
  // Staff of Homa at its first rank: 20% HP, 0.8% ATK of Max HP, and 1% more of Max HP while HP is under half
  const staffOfHomaPassiveModule = createStaffOfHomaPassiveModule([0.2, 0.008, 0.01]);
  const wielder: Combatant = {
    ascension: 0,
    attributes: computeCharacterAttributes([{ attribute: Attribute.Health, value: 10000 }]),
    characterId: TRAVELER_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: TRAVELER_KIT,
    level: 1,
  };

  test("the wielder's HP is raised by the rank's percentage and its ATK by the rank's share of Max HP at full HP", () => {
    expect.hasAssertions();

    expect(staffOfHomaPassiveModule.getPassiveBonuses?.(wielder, 1, [], [])).toStrictEqual([
      { amount: 0.2, attribute: Attribute.HealthPercent },
      { amount: 0.008 * 10000, attribute: Attribute.Attack },
    ]);
  });

  test("the ATK bonus gains the rank's extra share of Max HP while HP is under half", () => {
    expect.hasAssertions();

    expect(staffOfHomaPassiveModule.getPassiveBonuses?.(wielder, 0.4, [], [])).toStrictEqual([
      { amount: 0.2, attribute: Attribute.HealthPercent },
      { amount: (0.008 + 0.01) * 10000, attribute: Attribute.Attack },
    ]);
  });

  test("the extra share is not gained at exactly half HP", () => {
    expect.hasAssertions();

    expect(staffOfHomaPassiveModule.getPassiveBonuses?.(wielder, 0.5, [], [])).toStrictEqual([
      { amount: 0.2, attribute: Attribute.HealthPercent },
      { amount: 0.008 * 10000, attribute: Attribute.Attack },
    ]);
  });
});
