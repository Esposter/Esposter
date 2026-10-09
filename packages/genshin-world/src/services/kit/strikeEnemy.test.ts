import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitHit } from "#src/models/kit/KitHit";

import { Attribute } from "#src/models/character/Attribute";
import { AuraType } from "#src/models/combat/AuraType";
import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { ReactionType } from "#src/models/combat/ReactionType";
import { Element } from "#src/models/Element";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { applyElement } from "#src/services/combat/aura/applyElement";
import { getDamage } from "#src/services/combat/damage/getDamage";
import { getTransformativeDamage } from "#src/services/combat/damage/getTransformativeDamage";
import { addEnemyStatus } from "#src/services/enemy/addEnemyStatus";
import { computeEnemyStats } from "#src/services/enemy/computeEnemyStats";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { getEnemyKind } from "#src/services/enemy/getEnemyKind";
import { createTravelerKit } from "#src/services/kit/characters/travelerKit";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { strikeEnemy } from "#src/services/kit/strikeEnemy";
import { ID_SEPARATOR, takeOne } from "@esposter/shared";
import { createSeededRandom } from "genshin-engine";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = createTravelerKit(await readTalentMultipliers([TRAVELER_CHARACTER_ID]));

const NEVER_CRITICAL = (): number => 1;

describe(strikeEnemy, () => {
  const CHARACTER_ID = 1;
  const LEVEL = 90;
  const ATTACK = 100;
  const STURDY_HEALTH = 1e9;
  const kind = getEnemyKind(ENEMY_CAMP_MEMBER.enemyKindId);
  const { defense } = computeEnemyStats(kind, ENEMY_CAMP_MEMBER.level);

  const createSturdyEnemy = (): Enemy => ({
    ...createEnemy(ENEMY_CAMP_MEMBER, ""),
    health: STURDY_HEALTH,
    maxHealth: STURDY_HEALTH,
  });

  const createCryoEnemy = (): Enemy => {
    const enemy = createSturdyEnemy();
    applyElement(enemy.elementalState, Element.Cryo, 1);
    return enemy;
  };

  const createCombatant = (element?: Element): Combatant => ({
    ascension: 0,
    attributes: computeCharacterAttributes([{ attribute: Attribute.Attack, value: ATTACK }]),
    characterId: CHARACTER_ID,
    constellationCount: 0,
    element,
    elementalResonances: [],
    kit: TRAVELER_KIT,
    level: LEVEL,
  });

  test("gives Shattering Ice's CRIT Rate against a Cryo-affected enemy, and none without it", () => {
    expect.hasAssertions();

    const CRITICAL_DAMAGE = 0.5;
    const ROLL = 0.2;
    const { talentMultiplier } = TRAVELER_KIT.plungeCollision;
    const damage = (isCritical: boolean): number =>
      getDamage({
        attackerLevel: LEVEL,
        criticalDamage: CRITICAL_DAMAGE,
        defense,
        isCritical,
        resistance: kind.physicalResistance,
        stat: ATTACK,
        talentMultiplier,
      });
    const createCriticalCombatant = (elementalResonances: Combatant["elementalResonances"]): Combatant => ({
      ascension: 0,
      attributes: computeCharacterAttributes([
        { attribute: Attribute.Attack, value: ATTACK },
        { attribute: Attribute.CriticalDamage, value: CRITICAL_DAMAGE },
        { attribute: Attribute.CriticalRate, value: 0.1 },
      ]),
      characterId: CHARACTER_ID,
      constellationCount: 0,
      elementalResonances,
      kit: TRAVELER_KIT,
      level: LEVEL,
    });
    const resonatedEnemy = createCryoEnemy();
    const unresonatedEnemy = createCryoEnemy();

    strikeEnemy(resonatedEnemy, TRAVELER_KIT.plungeCollision, createCriticalCombatant([Element.Cryo]), () => ROLL);
    strikeEnemy(unresonatedEnemy, TRAVELER_KIT.plungeCollision, createCriticalCombatant([]), () => ROLL);

    expect([resonatedEnemy.health, unresonatedEnemy.health]).toStrictEqual([
      resonatedEnemy.maxHealth - damage(true),
      unresonatedEnemy.maxHealth - damage(false),
    ]);
  });

  test("draws its CRIT rolls from the seeded source, so the same seed prices the same hits", () => {
    expect.hasAssertions();

    const STRIKE_COUNT = 20;
    const SEED = 1;
    const OTHER_SEED = 2;
    const combatant: Combatant = {
      ...createCombatant(),
      attributes: computeCharacterAttributes([
        { attribute: Attribute.Attack, value: ATTACK },
        { attribute: Attribute.CriticalDamage, value: 1 },
        { attribute: Attribute.CriticalRate, value: 0.5 },
      ]),
    };
    const strikeDamages = (seed: number): number[] => {
      const random = createSeededRandom(seed);
      return Array.from({ length: STRIKE_COUNT }, () => {
        const enemy = createSturdyEnemy();
        strikeEnemy(enemy, TRAVELER_KIT.plungeCollision, combatant, random);
        return enemy.maxHealth - enemy.health;
      });
    };

    expect(strikeDamages(SEED)).toStrictEqual(strikeDamages(SEED));
    expect(strikeDamages(SEED)).not.toStrictEqual(strikeDamages(OTHER_SEED));
  });

  test("deals a physical hit the damage of the general formula", () => {
    expect.hasAssertions();

    const enemy = createSturdyEnemy();
    const { talentMultiplier } = TRAVELER_KIT.plungeCollision;
    const damage = getDamage({
      attackerLevel: LEVEL,
      defense,
      resistance: kind.physicalResistance,
      stat: ATTACK,
      talentMultiplier,
    });

    strikeEnemy(enemy, TRAVELER_KIT.plungeCollision, createCombatant(), NEVER_CRITICAL);

    expect(enemy.health).toBeCloseTo(enemy.maxHealth - damage);
  });

  test("applies the element a hit deals over its character's own", () => {
    expect.hasAssertions();

    const enemy = createSturdyEnemy();
    const kitHit = { ...takeOne(TRAVELER_KIT.elementalSkill.hits, 0), element: Element.Hydro };
    strikeEnemy(enemy, kitHit, createCombatant(Element.Pyro), NEVER_CRITICAL);

    expect(enemy.elementalState.auras.has(AuraType.Hydro)).toBe(true);
    expect(enemy.elementalState.auras.has(AuraType.Pyro)).toBe(false);
  });

  test("applies an element on the first hit of its internal cooldown, keyed by attacker and tag", () => {
    expect.hasAssertions();

    const enemy = createSturdyEnemy();
    strikeEnemy(enemy, takeOne(TRAVELER_KIT.elementalSkill.hits, 0), createCombatant(Element.Pyro), NEVER_CRITICAL);

    expect(enemy.elementalState.auras.has(AuraType.Pyro)).toBe(true);
    expect(
      enemy.internalCooldownMap.get(`${CHARACTER_ID}${ID_SEPARATOR}${InternalCooldownTag.ElementalSkill}`),
    ).toStrictEqual({ hitIndex: 0, startSeconds: 0 });
  });

  test("shatters a Freeze with a blunt hit, and deals the Shatter's damage", () => {
    expect.hasAssertions();

    const enemy = createSturdyEnemy();
    enemy.elementalState.auras.set(AuraType.Freeze, { decayRate: 0, gauge: 1 });
    const kitHit = takeOne(TRAVELER_KIT.lowPlunge.hits, 0);
    const damage = getDamage({
      attackerLevel: LEVEL,
      defense,
      resistance: kind.physicalResistance,
      stat: ATTACK,
      talentMultiplier: kitHit.talentMultiplier,
    });
    const shatterDamage = getTransformativeDamage(ReactionType.Shattered, LEVEL, 0, kind.physicalResistance);

    strikeEnemy(enemy, kitHit, createCombatant(), NEVER_CRITICAL);

    expect(enemy.elementalState.auras.has(AuraType.Freeze)).toBe(false);
    expect(enemy.health).toBeCloseTo(enemy.maxHealth - damage - shatterDamage);
  });

  test("amplifies a Hydro hit that Vaporizes a Pyro aura", () => {
    expect.hasAssertions();

    const enemy = createSturdyEnemy();
    strikeEnemy(enemy, takeOne(TRAVELER_KIT.elementalBurst.hits, 0), createCombatant(Element.Pyro), NEVER_CRITICAL);
    const healthBeforeHydro = enemy.health;
    const hydroHit = takeOne(TRAVELER_KIT.elementalSkill.hits, 0);
    const damage = getDamage({
      amplifyingMultiplier: 2,
      attackerLevel: LEVEL,
      defense,
      resistance: kind.elementResistances[Element.Hydro],
      stat: ATTACK,
      talentMultiplier: hydroHit.talentMultiplier,
    });

    strikeEnemy(enemy, hydroHit, createCombatant(Element.Hydro), NEVER_CRITICAL);

    expect(healthBeforeHydro - enemy.health).toBeCloseTo(damage);
  });

  test("adds an enemy's statuses' DMG taken to the damage bonus of each hit on it", () => {
    expect.hasAssertions();

    const OMEN_DAMAGE_TAKEN_BONUS = 0.42;
    const enemy = createSturdyEnemy();
    addEnemyStatus(enemy, { damageTakenBonus: OMEN_DAMAGE_TAKEN_BONUS, id: "omen", secondsRemaining: 4 });
    const { talentMultiplier } = TRAVELER_KIT.plungeCollision;
    const damage = getDamage({
      attackerLevel: LEVEL,
      damageBonus: OMEN_DAMAGE_TAKEN_BONUS,
      defense,
      resistance: kind.physicalResistance,
      stat: ATTACK,
      talentMultiplier,
    });

    strikeEnemy(enemy, TRAVELER_KIT.plungeCollision, createCombatant(), NEVER_CRITICAL);

    expect(enemy.health).toBeCloseTo(enemy.maxHealth - damage);
  });

  test("gives the enemy a hit's status before the hit's damage is taken", () => {
    expect.hasAssertions();

    const enemy = createSturdyEnemy();
    const hit: KitHit = {
      ...TRAVELER_KIT.plungeCollision,
      enemyStatus: () => ({ damageTakenBonus: 0.42, id: "omen", secondsRemaining: 4 }),
    };

    strikeEnemy(enemy, hit, createCombatant(), NEVER_CRITICAL);

    expect(enemy.statuses).toStrictEqual([{ damageTakenBonus: 0.42, id: "omen", secondsRemaining: 4 }]);
  });
});
