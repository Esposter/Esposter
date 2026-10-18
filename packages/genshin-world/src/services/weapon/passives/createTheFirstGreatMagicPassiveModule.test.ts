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
import { createDeployedCombatant } from "#src/services/party/createDeployedCombatant.test";
import { createParty } from "#src/services/party/createParty";
import { createTheFirstGreatMagicPassiveModule } from "#src/services/weapon/passives/createTheFirstGreatMagicPassiveModule";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
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

describe(createTheFirstGreatMagicPassiveModule, () => {
  // Synthetic params, not the weapon's row: half Charged Attack DMG, a tenth, a fifth and three tenths ATK for one,
  // Two and three or more Gimmick stacks of the wielder's Elemental Type, a twentieth, a tenth and three twentieths
  // Movement SPD for one, two and three or more Theatrics stacks of other Elemental Types
  const theFirstGreatMagicPassiveModule = createTheFirstGreatMagicPassiveModule([
    0.5, 0.1, 0.2, 0.3, 0.05, 0.1, 0.15, 0,
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
    ).toBe(0.5);
    expect(
      theFirstGreatMagicPassiveModule.getStrikeDamageBonus?.(createStrike(AttackTag.NormalAttack), enemy, party, []),
    ).toBe(0);
  });

  test("two Gimmick stacks and two Theatrics stacks raise ATK and Movement SPD by the second shares", () => {
    expect.hasAssertions();

    const deployedCombatants = [
      createDeployedCombatant(wielder, { isOnField: true }),
      createMember(1, Element.Pyro),
      createMember(2, Element.Hydro),
      createMember(3, Element.Cryo),
    ];

    expect(theFirstGreatMagicPassiveModule.getPassiveBonuses?.(wielder, 1, deployedCombatants, [])).toStrictEqual([
      { amount: 0.2, attribute: Attribute.AttackPercent },
      { amount: 0.1, attribute: Attribute.MovementSpeed },
    ]);
  });

  test("a team of the wielder's Elemental Type reaches the third share of ATK and no Movement SPD", () => {
    expect.hasAssertions();

    const deployedCombatants = [
      createDeployedCombatant(wielder, { isOnField: true }),
      createMember(1, Element.Pyro),
      createMember(2, Element.Pyro),
      createMember(3, Element.Pyro),
    ];

    expect(theFirstGreatMagicPassiveModule.getPassiveBonuses?.(wielder, 1, deployedCombatants, [])).toStrictEqual([
      { amount: 0.3, attribute: Attribute.AttackPercent },
      { amount: 0, attribute: Attribute.MovementSpeed },
    ]);
  });

  test("the wielder alone holds one Gimmick stack and no Theatrics stack", () => {
    expect.hasAssertions();

    expect(
      theFirstGreatMagicPassiveModule.getPassiveBonuses?.(
        wielder,
        1,
        [createDeployedCombatant(wielder, { isOnField: true })],
        [],
      ),
    ).toStrictEqual([
      { amount: 0.1, attribute: Attribute.AttackPercent },
      { amount: 0, attribute: Attribute.MovementSpeed },
    ]);
  });
});
