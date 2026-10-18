import type { Combatant } from "#src/models/kit/Combatant";
import type { DeployedCombatant } from "#src/models/kit/DeployedCombatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createFlowerFeatherSongPassiveModule } from "#src/services/weapon/passives/createFlowerFeatherSongPassiveModule";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const createMember = (characterId: number, element: Element, regionId?: string): DeployedCombatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([]),
  characterId,
  constellationCount: 0,
  element,
  elementalResonances: [],
  isOnField: false,
  kit: TRAVELER_KIT,
  level: 1,
  regionId,
});

describe(createFlowerFeatherSongPassiveModule, () => {
  // Flower-Feather Song at its first rank: 4.8% ATK for each counted member, and 24 Elemental Mastery with three of them
  const flowerFeatherSongPassiveModule = createFlowerFeatherSongPassiveModule([0.048, 24, 0]);
  const wielder: Combatant = createMember(TRAVELER_CHARACTER_ID, Element.Pyro);

  test("each other party member from Natlan or of another element adds the rank's ATK, and a member of the wielder's element outside Natlan does not", () => {
    expect.hasAssertions();

    const deployedCombatants = [
      { ...wielder, isOnField: true },
      createMember(1, Element.Hydro),
      createMember(2, Element.Pyro, "natlan"),
      createMember(3, Element.Pyro),
    ];

    expect(flowerFeatherSongPassiveModule.getPassiveBonuses?.(wielder, 1, deployedCombatants, [])).toStrictEqual([
      { amount: 0.048 * 2, attribute: Attribute.AttackPercent },
      { amount: 0, attribute: Attribute.ElementalMastery },
    ]);
  });

  test("three such members add the rank's Elemental Mastery as well", () => {
    expect.hasAssertions();

    const deployedCombatants = [
      { ...wielder, isOnField: true },
      createMember(1, Element.Hydro),
      createMember(2, Element.Pyro, "natlan"),
      createMember(3, Element.Cryo),
    ];

    expect(flowerFeatherSongPassiveModule.getPassiveBonuses?.(wielder, 1, deployedCombatants, [])).toStrictEqual([
      { amount: 0.048 * 3, attribute: Attribute.AttackPercent },
      { amount: 24, attribute: Attribute.ElementalMastery },
    ]);
  });

  test("the wielder is not counted toward its own team", () => {
    expect.hasAssertions();

    const natlanWielder: Combatant = createMember(TRAVELER_CHARACTER_ID, Element.Pyro, "natlan");

    expect(
      flowerFeatherSongPassiveModule.getPassiveBonuses?.(natlanWielder, 1, [{ ...natlanWielder, isOnField: true }], []),
    ).toStrictEqual([
      { amount: 0, attribute: Attribute.AttackPercent },
      { amount: 0, attribute: Attribute.ElementalMastery },
    ]);
  });
});
