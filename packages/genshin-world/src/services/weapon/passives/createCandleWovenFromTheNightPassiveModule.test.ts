import type { Combatant } from "#src/models/kit/Combatant";
import type { DeployedCombatant } from "#src/models/kit/DeployedCombatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createDeployedCombatant } from "#src/services/party/createDeployedCombatant.test";
import { createCandleWovenFromTheNightPassiveModule } from "#src/services/weapon/passives/createCandleWovenFromTheNightPassiveModule";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const createMember = (characterId: number, element: Element): DeployedCombatant =>
  createDeployedCombatant(
    {
      ascension: 0,
      attributes: computeCharacterAttributes([]),
      characterId,
      constellationCount: 0,
      element,
      elementalResonances: [],
      kit: TRAVELER_KIT,
      level: 1,
    },
    { isOnField: false },
  );

describe(createCandleWovenFromTheNightPassiveModule, () => {
  const wielder: Combatant = createMember(TRAVELER_CHARACTER_ID, Element.Pyro);

  test("a member of the wielder's element adds the rank's Elemental Mastery, and one of another element the rank's ATK", () => {
    expect.hasAssertions();

    // Jade Vista at its first rank: 12% ATK and 64 Elemental Mastery for each party member
    const passiveModule = createCandleWovenFromTheNightPassiveModule([0.12, 64]);
    const deployedCombatants = [
      createDeployedCombatant(wielder, { isOnField: true }),
      createMember(1, Element.Pyro),
      createMember(2, Element.Hydro),
    ];

    expect(passiveModule.getPassiveBonuses?.(wielder, 1, deployedCombatants, [])).toStrictEqual([
      { amount: 64, attribute: Attribute.ElementalMastery },
      { amount: 0.12, attribute: Attribute.AttackPercent },
    ]);
  });

  test("the Elemental Mastery stacks are taken first, and three stacks in all are the most", () => {
    expect.hasAssertions();

    // Jade Vista at its fifth rank: 24% ATK and 128 Elemental Mastery for each party member
    const passiveModule = createCandleWovenFromTheNightPassiveModule([0.24, 128]);
    const deployedCombatants = [
      createDeployedCombatant(wielder, { isOnField: true }),
      createMember(1, Element.Pyro),
      createMember(2, Element.Hydro),
      createMember(3, Element.Cryo),
      createMember(4, Element.Electro),
    ];

    expect(passiveModule.getPassiveBonuses?.(wielder, 1, deployedCombatants, [])).toStrictEqual([
      { amount: 128, attribute: Attribute.ElementalMastery },
      { amount: 0.24 * 2, attribute: Attribute.AttackPercent },
    ]);
  });

  test("the wielder is not counted toward its own party", () => {
    expect.hasAssertions();

    const passiveModule = createCandleWovenFromTheNightPassiveModule([0.12, 64]);

    expect(
      passiveModule.getPassiveBonuses?.(wielder, 1, [createDeployedCombatant(wielder, { isOnField: true })], []),
    ).toStrictEqual([
      { amount: 0, attribute: Attribute.ElementalMastery },
      { amount: 0, attribute: Attribute.AttackPercent },
    ]);
  });
});
