import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffect } from "#src/models/kit/KitEffect";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { DILUC_CHARACTER_ID } from "#src/services/kit/characters/dilucKit";
import { getBuffedCombatant } from "#src/services/kit/effects/getBuffedCombatant";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { strikeEnemy } from "#src/services/kit/strikeEnemy";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const DILUC_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, DILUC_CHARACTER_ID);

describe(getBuffedCombatant, () => {
  const CHARACTER_ID = 1;
  const OTHER_CHARACTER_ID = 2;
  const party = createParty([CHARACTER_ID]);

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
    const buffed = getBuffedCombatant(combatant, effects, party, new Map());
    expect(buffed.attributes.attack).toBe(combatant.attributes.attack + 30);
    expect(buffed.attributes.attributeTotalMap[Attribute.PyroDamageBonus]).toBeCloseTo(0.2);
    expect(getBuffedCombatant(combatant, [], party, new Map())).toBe(combatant);
  });

  test("raises the attack and defense its hits are priced from by a percentage buff on each", () => {
    expect.hasAssertions();
    const combatant = {
      ascension: 0,
      attributes: computeCharacterAttributes([
        { attribute: Attribute.BaseAttack, value: 100 },
        { attribute: Attribute.BaseDefense, value: 200 },
      ]),
      characterId: CHARACTER_ID,
      constellationCount: 0,
      elementalResonances: [],
      kit: DILUC_KIT,
      level: 90,
    };
    const effects: KitEffect[] = [
      { amount: 0.5, attribute: Attribute.AttackPercent, characterId: CHARACTER_ID, kind: "buff", secondsRemaining: 1 },
      {
        amount: 0.25,
        attribute: Attribute.DefensePercent,
        characterId: CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 1,
      },
    ];
    const buffed = getBuffedCombatant(combatant, effects, party, new Map());
    expect(buffed.attributes.attack).toBeCloseTo(150);
    expect(buffed.attributes.defense).toBeCloseTo(250);
  });

  test("a buff on Max HP raises the buffed combatant's max health, as a percentage of it does", () => {
    expect.hasAssertions();
    const combatant: Combatant = {
      ascension: 0,
      attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 1000 }]),
      characterId: CHARACTER_ID,
      constellationCount: 0,
      elementalResonances: [],
      kit: DILUC_KIT,
      level: 90,
    };
    const flatBuffed = getBuffedCombatant(
      combatant,
      [{ amount: 500, attribute: Attribute.Health, characterId: CHARACTER_ID, kind: "buff", secondsRemaining: 1 }],
      party,
      new Map(),
    );
    expect(flatBuffed.attributes.maxHealth).toStrictEqual(1500);
    const percentBuffed = getBuffedCombatant(
      combatant,
      [
        {
          amount: 0.5,
          attribute: Attribute.HealthPercent,
          characterId: CHARACTER_ID,
          kind: "buff",
          secondsRemaining: 1,
        },
      ],
      party,
      new Map(),
    );
    expect(percentBuffed.attributes.maxHealth).toStrictEqual(1500);
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

    const shielded = getBuffedCombatant(combatant, [shield], party, new Map());

    expect(shielded.attributes.attributeTotalMap[Attribute.GeoDamageBonus]).toBeCloseTo(0.15);
    expect(damageOf(shielded) / damageOf(getBuffedCombatant(combatant, [], party, new Map()))).toBeCloseTo(1.15);
  });

  test("hands a passive its character's HP as a share of its Max HP in the party", () => {
    expect.hasAssertions();

    const healthParty = createParty([CHARACTER_ID]);
    getPartyMember(healthParty, CHARACTER_ID).healthShare = 0.5;
    const combatant: Combatant = {
      ascension: 0,
      attributes: computeCharacterAttributes([]),
      characterId: CHARACTER_ID,
      constellationCount: 0,
      elementalResonances: [],
      kit: {
        ...DILUC_KIT,
        getPassiveBonuses: (_combatant, healthShare) => [{ amount: healthShare, attribute: Attribute.CriticalRate }],
      },
      level: 90,
    };

    expect(
      getBuffedCombatant(combatant, [], healthParty, new Map()).attributes.attributeTotalMap[Attribute.CriticalRate],
    ).toStrictEqual(combatant.attributes.attributeTotalMap[Attribute.CriticalRate] + 0.5);
  });

  test("hands a passive the deployed combatants on the team, so a bonus counts the members the team holds", () => {
    expect.hasAssertions();

    const combatant: Combatant = {
      ascension: 0,
      attributes: computeCharacterAttributes([]),
      characterId: CHARACTER_ID,
      constellationCount: 0,
      elementalResonances: [],
      kit: {
        ...DILUC_KIT,
        getPassiveBonuses: (_combatant, _healthShare, deployedCombatants) => [
          { amount: 0.1 * deployedCombatants.length, attribute: Attribute.CriticalRate },
        ],
      },
      level: 90,
    };
    const otherCombatant: Combatant = { ...combatant, characterId: OTHER_CHARACTER_ID };
    const characterIdCombatantMap = new Map([
      [CHARACTER_ID, combatant],
      [OTHER_CHARACTER_ID, otherCombatant],
    ]);

    expect(
      getBuffedCombatant(combatant, [], createParty([CHARACTER_ID, OTHER_CHARACTER_ID]), characterIdCombatantMap)
        .attributes.attributeTotalMap[Attribute.CriticalRate],
    ).toStrictEqual(combatant.attributes.attributeTotalMap[Attribute.CriticalRate] + 0.2);
  });
});
