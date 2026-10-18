import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { getResistanceMultiplier } from "#src/services/combat/damage/getResistanceMultiplier";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { computeEnemyStrikeDamage } from "#src/services/kit/computeEnemyStrikeDamage";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
// An enemy whose strikes carry the element given, or are physical with none
const createStrikingEnemy = (attackElement?: Element): Enemy => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  return { ...enemy, traits: { ...enemy.traits, attackElement } };
};

describe(computeEnemyStrikeDamage, () => {
  const RESISTANCE = 0.5;
  const createCombatant = (resistanceAttribute?: Attribute): Combatant => ({
    ascension: 0,
    attributes: computeCharacterAttributes([
      { attribute: Attribute.Defense, value: 100 },
      ...(resistanceAttribute === undefined ? [] : [{ attribute: resistanceAttribute, value: RESISTANCE }]),
    ]),
    characterId: 1,
    constellationCount: 0,
    elementalResonances: [],
    kit: TRAVELER_KIT,
    level: 1,
  });

  test.each<[string, Element | undefined, Attribute]>([
    ["an elemental enemy's strike against the combatant's RES to its element", Element.Pyro, Attribute.PyroResistance],
    ["a physical enemy's strike against the combatant's Physical RES", undefined, Attribute.PhysicalResistance],
  ])("prices %s", (_title, attackElement, resistanceAttribute) => {
    expect.hasAssertions();

    const enemy = createStrikingEnemy(attackElement);
    const unresistedDamage = computeEnemyStrikeDamage(enemyTables, enemy, createCombatant());

    expect(computeEnemyStrikeDamage(enemyTables, enemy, createCombatant(resistanceAttribute))).toBeCloseTo(
      unresistedDamage * getResistanceMultiplier(RESISTANCE),
    );
  });

  test("leaves an elemental enemy's strike unresisted by the combatant's Physical RES", () => {
    expect.hasAssertions();

    const enemy = createStrikingEnemy(Element.Pyro);

    expect(computeEnemyStrikeDamage(enemyTables, enemy, createCombatant(Attribute.PhysicalResistance))).toBe(
      computeEnemyStrikeDamage(enemyTables, enemy, createCombatant()),
    );
  });
});
