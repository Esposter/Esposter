import type { Combatant } from "#src/models/kit/Combatant";
import type { DeployedCombatant } from "#src/models/kit/DeployedCombatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { Element } from "#src/models/Element";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { createTheFirstGreatMagicPassiveModule } from "#src/services/weapon/passives/createTheFirstGreatMagicPassiveModule";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const createMember = (characterId: number, element: Element): DeployedCombatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([]),
  characterId,
  constellationCount: 0,
  element,
  elementalResonances: [],
  isOnField: false,
  kit: TRAVELER_KIT,
  level: 1,
});

describe(createTheFirstGreatMagicPassiveModule, () => {
  // The First Great Magic at its first rank: 16% Charged Attack DMG, 16%, 32% and 48% ATK for one, two and three or more
  // Gimmick stacks of the wielder's Elemental Type, and 4%, 7% and 10% Movement SPD for one, two and three or more
  // Theatrics stacks of other Elemental Types
  const theFirstGreatMagicPassiveModule = createTheFirstGreatMagicPassiveModule([
    0.16, 0.16, 0.32, 0.48, 0.04, 0.07, 0.1, 0,
  ]);
  const wielder: Combatant = {
    ascension: 0,
    attributes: computeCharacterAttributes([]),
    characterId: TRAVELER_CHARACTER_ID,
    constellationCount: 0,
    element: Element.Pyro,
    elementalResonances: [],
    kit: TRAVELER_KIT,
    level: 1,
  };
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const createStrike = (attackTag: AttackTag) => ({
    attackTag,
    body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
    combatant: wielder,
    hit: TRAVELER_KIT.plungeCollision,
  });

  test("a Charged Attack the wielder deals is raised by the rank's percentage and a normal attack is not", () => {
    expect.hasAssertions();

    const party = createParty([TRAVELER_CHARACTER_ID]);

    expect(
      theFirstGreatMagicPassiveModule.getStrikeDamageBonus?.(createStrike(AttackTag.ChargedAttack), enemy, party, []),
    ).toBe(0.16);
    expect(
      theFirstGreatMagicPassiveModule.getStrikeDamageBonus?.(createStrike(AttackTag.NormalAttack), enemy, party, []),
    ).toBe(0);
  });

  test("two Gimmick stacks and two Theatrics stacks raise ATK and Movement SPD by the second shares", () => {
    expect.hasAssertions();

    const deployedCombatants = [
      { ...wielder, isOnField: true },
      createMember(1, Element.Pyro),
      createMember(2, Element.Hydro),
      createMember(3, Element.Cryo),
    ];

    expect(theFirstGreatMagicPassiveModule.getPassiveBonuses?.(wielder, 1, deployedCombatants, [])).toStrictEqual([
      { amount: 0.32, attribute: Attribute.AttackPercent },
      { amount: 0.07, attribute: Attribute.MovementSpeed },
    ]);
  });

  test("a team of the wielder's Elemental Type reaches the third share of ATK and no Movement SPD", () => {
    expect.hasAssertions();

    const deployedCombatants = [
      { ...wielder, isOnField: true },
      createMember(1, Element.Pyro),
      createMember(2, Element.Pyro),
      createMember(3, Element.Pyro),
    ];

    expect(theFirstGreatMagicPassiveModule.getPassiveBonuses?.(wielder, 1, deployedCombatants, [])).toStrictEqual([
      { amount: 0.48, attribute: Attribute.AttackPercent },
      { amount: 0, attribute: Attribute.MovementSpeed },
    ]);
  });

  test("the wielder alone holds one Gimmick stack and no Theatrics stack", () => {
    expect.hasAssertions();

    expect(
      theFirstGreatMagicPassiveModule.getPassiveBonuses?.(wielder, 1, [{ ...wielder, isOnField: true }], []),
    ).toStrictEqual([
      { amount: 0.16, attribute: Attribute.AttackPercent },
      { amount: 0, attribute: Attribute.MovementSpeed },
    ]);
  });
});
