import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffect } from "#src/models/kit/KitEffect";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { DILUC_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createDilucKit } from "#src/services/kit/characters/dilucKit";
import { getBuffedCombatant } from "#src/services/kit/effects/getBuffedCombatant";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { strikeEnemy } from "#src/services/kit/strikeEnemy";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const DILUC_KIT = createDilucKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [DILUC_CHARACTER_ID]));

describe(getBuffedCombatant, () => {
  const CHARACTER_ID = 1;

  test("adds a flat ATK buff to the attack and a damage bonus to its attribute, and ignores another character's buff", () => {
    expect.hasAssertions();
    const combatant = {
      ascension: 0,
      attributes: computeCharacterAttributes([{ attribute: Attribute.BaseAttack, value: 100 }]),
      characterId: CHARACTER_ID,
      constellationCount: 0,
      elementalResonances: [],
      kit: DILUC_KIT,
      level: 90,
    };
    const effects: KitEffect[] = [
      { amount: 30, attribute: Attribute.Attack, characterId: CHARACTER_ID, kind: "buff", secondsRemaining: 1 },
      {
        amount: 0.2,
        attribute: Attribute.PyroDamageBonus,
        characterId: CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 1,
      },
      { amount: 0.5, attribute: Attribute.PyroDamageBonus, characterId: 2, kind: "buff", secondsRemaining: 1 },
    ];
    const buffed = getBuffedCombatant(combatant, effects);
    expect(buffed.attributes.attack).toBe(combatant.attributes.attack + 30);
    expect(buffed.attributes.attributeTotalMap[Attribute.PyroDamageBonus]).toBeCloseTo(0.2);
    expect(getBuffedCombatant(combatant, [])).toBe(combatant);
  });

  test("raises a Geo team's hits by 15% while a shield holds it, so a hit deals 1.15 times its damage", () => {
    expect.hasAssertions();

    const ENDURING_ROCK_HEALTH = 1e9;
    const combatant: Combatant = {
      ascension: 0,
      attributes: computeCharacterAttributes([{ attribute: Attribute.Attack, value: 100 }]),
      characterId: CHARACTER_ID,
      constellationCount: 0,
      elementalResonances: [Element.Geo],
      kit: DILUC_KIT,
      level: 90,
    };
    const shield: KitEffect = { characterId: 2, health: 100, kind: "shield", secondsRemaining: 12 };
    const damageOf = (buffed: Combatant): number => {
      const enemy = {
        ...createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""),
        health: ENDURING_ROCK_HEALTH,
        maxHealth: ENDURING_ROCK_HEALTH,
      };
      strikeEnemy(enemyTables, enemy, DILUC_KIT.plungeCollision, buffed, () => 1);
      return enemy.maxHealth - enemy.health;
    };

    const shielded = getBuffedCombatant(combatant, [shield]);

    expect(shielded.attributes.attributeTotalMap[Attribute.GeoDamageBonus]).toBeCloseTo(0.15);
    expect(damageOf(shielded) / damageOf(getBuffedCombatant(combatant, []))).toBeCloseTo(1.15);
  });
});
