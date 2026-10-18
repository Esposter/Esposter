import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitHit } from "#src/models/kit/KitHit";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AuraType } from "#src/models/combat/AuraType";
import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { LunarReactionType } from "#src/models/combat/LunarReactionType";
import { ReactionType } from "#src/models/combat/ReactionType";
import { Element } from "#src/models/Element";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { applyElement } from "#src/services/combat/aura/applyElement";
import { getDamage } from "#src/services/combat/damage/getDamage";
import { getLunarDamage } from "#src/services/combat/damage/getLunarDamage";
import { getResistanceMultiplier } from "#src/services/combat/damage/getResistanceMultiplier";
import { getTransformativeDamage } from "#src/services/combat/damage/getTransformativeDamage";
import { addEnemyStatus } from "#src/services/enemy/addEnemyStatus";
import { computeEnemyStats } from "#src/services/enemy/computeEnemyStats";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { getEnemyKind } from "#src/services/enemy/getEnemyKind";
import { getEnemyResistance } from "#src/services/enemy/getEnemyResistance";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { strikeEnemy } from "#src/services/kit/strikeEnemy";
import { ID_SEPARATOR, takeOne } from "@esposter/shared";
import { createSeededRandom } from "genshin-engine";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

// Gcsim gives the Traveler's skill hit the Wind element; these reaction tests need the element-less hit the record held before.
const elementlessSkillHit = (): KitHit => ({ ...takeOne(TRAVELER_KIT.elementalSkill.hits, 0), element: undefined });
const NEVER_CRITICAL = (): number => 1;

describe(strikeEnemy, () => {
  const CHARACTER_ID = 1;
  const LEVEL = 90;
  const ATTACK = 100;
  const STURDY_HEALTH = 1e9;
  const kind = getEnemyKind(enemyTables.enemyKindMap, ENEMY_CAMP_MEMBER.enemyKindId);
  const { defense } = computeEnemyStats(enemyTables.enemyLevelCurves, kind, ENEMY_CAMP_MEMBER.level);
  const createSturdyEnemy = (): Enemy => ({
    ...createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""),
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

    strikeEnemy(
      enemyTables,
      resonatedEnemy,
      TRAVELER_KIT.plungeCollision,
      createCriticalCombatant([Element.Cryo]),
      () => ROLL,
    );
    strikeEnemy(enemyTables, unresonatedEnemy, TRAVELER_KIT.plungeCollision, createCriticalCombatant([]), () => ROLL);

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
        strikeEnemy(enemyTables, enemy, TRAVELER_KIT.plungeCollision, combatant, random);
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

    strikeEnemy(enemyTables, enemy, TRAVELER_KIT.plungeCollision, createCombatant(), NEVER_CRITICAL);

    expect(enemy.health).toBeCloseTo(enemy.maxHealth - damage);
  });

  test("raises a physical hit's damage by the all-damage bonus its character carries", () => {
    expect.hasAssertions();

    const ALL_DAMAGE_BONUS = 0.5;
    const enemy = createSturdyEnemy();
    const { talentMultiplier } = TRAVELER_KIT.plungeCollision;
    const damage = getDamage({
      attackerLevel: LEVEL,
      damageBonus: ALL_DAMAGE_BONUS,
      defense,
      resistance: kind.physicalResistance,
      stat: ATTACK,
      talentMultiplier,
    });
    const combatant = {
      ...createCombatant(),
      attributes: computeCharacterAttributes([
        { attribute: Attribute.Attack, value: ATTACK },
        { attribute: Attribute.AllDamageBonus, value: ALL_DAMAGE_BONUS },
      ]),
    };

    strikeEnemy(enemyTables, enemy, TRAVELER_KIT.plungeCollision, combatant, NEVER_CRITICAL);

    expect(enemy.health).toBeCloseTo(enemy.maxHealth - damage);
  });

  test("raises an elemental hit's damage by the all-damage bonus too", () => {
    expect.hasAssertions();

    const kitHit = { ...takeOne(TRAVELER_KIT.elementalSkill.hits, 0), element: Element.Hydro };
    const plainEnemy = createSturdyEnemy();
    const boostedEnemy = createSturdyEnemy();
    const boostedCombatant = {
      ...createCombatant(Element.Pyro),
      attributes: computeCharacterAttributes([
        { attribute: Attribute.Attack, value: ATTACK },
        { attribute: Attribute.AllDamageBonus, value: 0.5 },
      ]),
    };
    strikeEnemy(enemyTables, plainEnemy, kitHit, createCombatant(Element.Pyro), NEVER_CRITICAL);
    strikeEnemy(enemyTables, boostedEnemy, kitHit, boostedCombatant, NEVER_CRITICAL);

    expect(boostedEnemy.maxHealth - boostedEnemy.health).toBeGreaterThan(plainEnemy.maxHealth - plainEnemy.health);
  });

  test("applies the element a hit deals over its character's own", () => {
    expect.hasAssertions();

    const enemy = createSturdyEnemy();
    const kitHit = { ...takeOne(TRAVELER_KIT.elementalSkill.hits, 0), element: Element.Hydro };
    strikeEnemy(enemyTables, enemy, kitHit, createCombatant(Element.Pyro), NEVER_CRITICAL);

    expect(enemy.elementalState.auras.has(AuraType.Hydro)).toBe(true);
    expect(enemy.elementalState.auras.has(AuraType.Pyro)).toBe(false);
  });

  test("applies an element on the first hit of its internal cooldown, keyed by attacker and tag", () => {
    expect.hasAssertions();

    const enemy = createSturdyEnemy();
    strikeEnemy(enemyTables, enemy, elementlessSkillHit(), createCombatant(Element.Pyro), NEVER_CRITICAL);

    expect(enemy.elementalState.auras.has(AuraType.Pyro)).toBe(true);
    expect(
      enemy.internalCooldownMap.get(`${CHARACTER_ID}${ID_SEPARATOR}${InternalCooldownTag.ElementalSkill}`),
    ).toStrictEqual({ hitIndex: 0, startSeconds: 0 });
  });

  test("counts a hit under its tag's own internal cooldown group, which a standard group's reset does not restart", () => {
    expect.hasAssertions();

    const enemy = createSturdyEnemy();
    const kitHit = {
      ...takeOne(TRAVELER_KIT.elementalSkill.hits, 0),
      internalCooldownTag: InternalCooldownTag.FurinaChevalmarin,
    };
    strikeEnemy(enemyTables, enemy, kitHit, createCombatant(Element.Hydro), NEVER_CRITICAL);
    enemy.elementalState.seconds = 3;
    strikeEnemy(enemyTables, enemy, kitHit, createCombatant(Element.Hydro), NEVER_CRITICAL);

    expect(
      enemy.internalCooldownMap.get(`${CHARACTER_ID}${ID_SEPARATOR}${InternalCooldownTag.FurinaChevalmarin}`),
    ).toStrictEqual({ hitIndex: 1, startSeconds: 0 });
  });

  test("shatters a Freeze with a blunt hit, and deals the Shatter's damage", () => {
    expect.hasAssertions();

    const enemy = createSturdyEnemy();
    enemy.elementalState.auras.set(AuraType.Freeze, { decayRate: 0, gauge: 1, isImmutable: false });
    const kitHit = takeOne(TRAVELER_KIT.lowPlunge.hits, 0);
    const damage = getDamage({
      attackerLevel: LEVEL,
      defense,
      resistance: kind.physicalResistance,
      stat: ATTACK,
      talentMultiplier: kitHit.talentMultiplier,
    });
    const shatterDamage = getTransformativeDamage(ReactionType.Shattered, LEVEL, 0, kind.physicalResistance);

    strikeEnemy(enemyTables, enemy, kitHit, createCombatant(), NEVER_CRITICAL);

    expect(enemy.elementalState.auras.has(AuraType.Freeze)).toBe(false);
    expect(enemy.health).toBeCloseTo(enemy.maxHealth - damage - shatterDamage);
  });

  test("amplifies a Hydro hit that Vaporizes a Pyro aura", () => {
    expect.hasAssertions();

    const enemy = createSturdyEnemy();
    strikeEnemy(
      enemyTables,
      enemy,
      takeOne(TRAVELER_KIT.elementalBurst.hits, 0),
      createCombatant(Element.Pyro),
      NEVER_CRITICAL,
    );
    const healthBeforeHydro = enemy.health;
    const hydroHit = elementlessSkillHit();
    const damage = getDamage({
      amplifyingMultiplier: 2,
      attackerLevel: LEVEL,
      defense,
      resistance: kind.elementResistances[Element.Hydro],
      stat: ATTACK,
      talentMultiplier: hydroHit.talentMultiplier,
    });

    strikeEnemy(enemyTables, enemy, hydroHit, createCombatant(Element.Hydro), NEVER_CRITICAL);

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

    strikeEnemy(enemyTables, enemy, TRAVELER_KIT.plungeCollision, createCombatant(), NEVER_CRITICAL);

    expect(enemy.health).toBeCloseTo(enemy.maxHealth - damage);
  });

  test("adds a hit's own DMG Bonus to the damage bonus it is priced at", () => {
    expect.hasAssertions();

    const HIT_DAMAGE_BONUS = 0.5845;
    const enemy = createSturdyEnemy();
    const hit: KitHit = { ...TRAVELER_KIT.plungeCollision, damageBonus: HIT_DAMAGE_BONUS };
    const damage = getDamage({
      attackerLevel: LEVEL,
      damageBonus: HIT_DAMAGE_BONUS,
      defense,
      resistance: kind.physicalResistance,
      stat: ATTACK,
      talentMultiplier: hit.talentMultiplier,
    });

    strikeEnemy(enemyTables, enemy, hit, createCombatant(), NEVER_CRITICAL);

    expect(enemy.health).toBeCloseTo(enemy.maxHealth - damage);
  });

  test("gives the enemy a hit's status before the hit's damage is taken", () => {
    expect.hasAssertions();

    const enemy = createSturdyEnemy();
    const hit: KitHit = {
      ...TRAVELER_KIT.plungeCollision,
      enemyStatus: () => ({ damageTakenBonus: 0.42, id: "omen", secondsRemaining: 4 }),
    };

    strikeEnemy(enemyTables, enemy, hit, createCombatant(), NEVER_CRITICAL);

    expect(enemy.statuses).toStrictEqual([{ damageTakenBonus: 0.42, id: "omen", secondsRemaining: 4 }]);
  });

  test("adds a hit's additive base DMG bonus, read from its striker, to the base damage it is priced at", () => {
    expect.hasAssertions();

    const ADDITIVE_BASE_DAMAGE_BONUS = 278;
    const enemy = createSturdyEnemy();
    const combatant = createCombatant();
    const hit: KitHit = {
      ...TRAVELER_KIT.plungeCollision,
      additiveBaseDamageBonus: ({ characterId }) => (characterId === CHARACTER_ID ? ADDITIVE_BASE_DAMAGE_BONUS : 0),
    };
    const damage = getDamage({
      additiveBaseDamageBonus: ADDITIVE_BASE_DAMAGE_BONUS,
      attackerLevel: LEVEL,
      defense,
      resistance: kind.physicalResistance,
      stat: ATTACK,
      talentMultiplier: hit.talentMultiplier,
    });

    strikeEnemy(enemyTables, enemy, hit, combatant, NEVER_CRITICAL);

    expect(enemy.health).toBeCloseTo(enemy.maxHealth - damage);
  });

  test("prices a direct Lunar hit by the Lunar formula over its scaling stat, with the Moonsign's bonuses and no Defence", () => {
    expect.hasAssertions();

    const ELEMENTAL_MASTERY = 400;
    const BASE_DAMAGE_BONUS = 0.07;
    const REACTION_BONUS = 0.18;
    const enemy = createSturdyEnemy();
    const combatant: Combatant = {
      ...createCombatant(),
      attributes: computeCharacterAttributes([
        { attribute: Attribute.Attack, value: ATTACK },
        { attribute: Attribute.ElementalMastery, value: ELEMENTAL_MASTERY },
      ]),
    };
    const hit: KitHit = {
      element: Element.Dendro,
      hitArea: TRAVELER_KIT.plungeCollision.hitArea,
      hitmarkSeconds: 0,
      lunarHit: {
        getScalingStat: ({ attributes }) => attributes.attributeTotalMap[Attribute.ElementalMastery],
        lunarReactionType: LunarReactionType.LunarBloom,
      },
      poiseDamage: 0,
      talentMultiplier: 2,
    };
    const damage =
      getLunarDamage(
        LunarReactionType.LunarBloom,
        2 * ELEMENTAL_MASTERY,
        ELEMENTAL_MASTERY,
        BASE_DAMAGE_BONUS,
        REACTION_BONUS,
      ) * getResistanceMultiplier(getEnemyResistance(kind, enemy, Element.Dendro));

    strikeEnemy(enemyTables, enemy, hit, combatant, NEVER_CRITICAL, {
      baseDamageBonusMap: { [LunarReactionType.LunarBloom]: BASE_DAMAGE_BONUS },
      lunarReactionTypes: [LunarReactionType.LunarBloom],
      reactionBonus: REACTION_BONUS,
    });

    expect(enemy.health).toBeCloseTo(enemy.maxHealth - damage);
  });

  test("takes an enemy's statuses' Physical RES reduction off the RES a physical hit reads", () => {
    expect.hasAssertions();

    const PHYSICAL_RESISTANCE_REDUCTION = 0.2;
    const enemy = createSturdyEnemy();
    addEnemyStatus(enemy, {
      damageTakenBonus: 0,
      id: "jade-shield",
      physicalResistanceReduction: PHYSICAL_RESISTANCE_REDUCTION,
      secondsRemaining: 1,
    });
    const damage = getDamage({
      attackerLevel: LEVEL,
      defense,
      resistance: kind.physicalResistance - PHYSICAL_RESISTANCE_REDUCTION,
      stat: ATTACK,
      talentMultiplier: TRAVELER_KIT.plungeCollision.talentMultiplier,
    });

    strikeEnemy(enemyTables, enemy, TRAVELER_KIT.plungeCollision, createCombatant(), NEVER_CRITICAL);

    expect(enemy.health).toBeCloseTo(enemy.maxHealth - damage);
  });

  test("takes Superconduct's 40% off the Physical RES a physical hit then reads", () => {
    expect.hasAssertions();

    const enemy = createCryoEnemy();
    const electroHit = { ...takeOne(TRAVELER_KIT.elementalSkill.hits, 0), element: Element.Electro };
    strikeEnemy(enemyTables, enemy, electroHit, createCombatant(), NEVER_CRITICAL);
    const healthBeforePhysical = enemy.health;
    const damage = getDamage({
      attackerLevel: LEVEL,
      defense,
      resistance: kind.physicalResistance - 0.4,
      stat: ATTACK,
      talentMultiplier: TRAVELER_KIT.plungeCollision.talentMultiplier,
    });

    strikeEnemy(enemyTables, enemy, TRAVELER_KIT.plungeCollision, createCombatant(), NEVER_CRITICAL);

    expect(healthBeforePhysical - enemy.health).toBeCloseTo(damage);
  });

  test("deals the enemy the poise of an Overloaded it triggers, breaking a minion's from a hit of none", () => {
    expect.hasAssertions();

    const enemy = createSturdyEnemy();
    enemy.elementalState.auras.set(AuraType.Pyro, { decayRate: 0, gauge: 4, isImmutable: true });
    const unreactedEnemy = createSturdyEnemy();
    const kitHit = { ...elementlessSkillHit(), poiseDamage: 0 };
    strikeEnemy(enemyTables, enemy, kitHit, createCombatant(Element.Electro), NEVER_CRITICAL);
    strikeEnemy(enemyTables, unreactedEnemy, kitHit, createCombatant(Element.Electro), NEVER_CRITICAL);

    expect([enemy.poise, unreactedEnemy.poise]).toStrictEqual([0, createSturdyEnemy().poise]);
  });

  test("breaks a Freeze under an Overloaded's blunt explosion, and shatters what is left", () => {
    expect.hasAssertions();

    const enemy = createSturdyEnemy();
    enemy.elementalState.auras.set(AuraType.Pyro, { decayRate: 0, gauge: 4, isImmutable: true });
    enemy.elementalState.auras.set(AuraType.Freeze, { decayRate: 0, gauge: 1, isImmutable: false });
    const kitHit = { ...elementlessSkillHit(), poiseDamage: 0 };
    const hitDamage = getDamage({
      attackerLevel: LEVEL,
      defense,
      resistance: kind.elementResistances[Element.Electro],
      stat: ATTACK,
      talentMultiplier: kitHit.talentMultiplier,
    });
    const overloadedDamage = getTransformativeDamage(
      ReactionType.Overloaded,
      LEVEL,
      0,
      kind.elementResistances[Element.Pyro],
    );
    const shatterDamage = getTransformativeDamage(ReactionType.Shattered, LEVEL, 0, kind.physicalResistance);

    strikeEnemy(enemyTables, enemy, kitHit, createCombatant(Element.Electro), NEVER_CRITICAL);

    expect(enemy.elementalState.auras.has(AuraType.Freeze)).toBe(false);
    expect(enemy.maxHealth - enemy.health).toBeCloseTo(hitDamage + overloadedDamage + shatterDamage);
  });

  test("deals a source's second Overloaded within half a second no damage", () => {
    expect.hasAssertions();

    const enemy = createSturdyEnemy();
    enemy.elementalState.auras.set(AuraType.Pyro, { decayRate: 0, gauge: 4, isImmutable: true });
    const combatant = createCombatant(Element.Electro);
    const skillHit = elementlessSkillHit();
    const burstHit = takeOne(TRAVELER_KIT.elementalBurst.hits, 0);
    const hitDamage = (talentMultiplier: number): number =>
      getDamage({
        attackerLevel: LEVEL,
        defense,
        resistance: kind.elementResistances[Element.Electro],
        stat: ATTACK,
        talentMultiplier,
      });
    const overloadedDamage = getTransformativeDamage(
      ReactionType.Overloaded,
      LEVEL,
      0,
      kind.elementResistances[Element.Pyro],
    );

    strikeEnemy(enemyTables, enemy, skillHit, combatant, NEVER_CRITICAL);
    const healthBeforeBurst = enemy.health;
    enemy.elementalState.seconds = 0.2;
    strikeEnemy(enemyTables, enemy, burstHit, combatant, NEVER_CRITICAL);

    expect(enemy.maxHealth - healthBeforeBurst).toBeCloseTo(hitDamage(skillHit.talentMultiplier) + overloadedDamage);
    expect(healthBeforeBurst - enemy.health).toBeCloseTo(hitDamage(burstHit.talentMultiplier));
  });

  test("returns a Swirl that lands to reach round the enemy, and none for a Swirl within a tenth of a second of it", () => {
    expect.hasAssertions();

    const enemy = createSturdyEnemy();
    enemy.elementalState.auras.set(AuraType.Pyro, { decayRate: 0, gauge: 4, isImmutable: true });
    const combatant = createCombatant(Element.Anemo);
    const first = strikeEnemy(enemyTables, enemy, elementlessSkillHit(), combatant, NEVER_CRITICAL);
    const second = strikeEnemy(
      enemyTables,
      enemy,
      takeOne(TRAVELER_KIT.elementalBurst.hits, 0),
      combatant,
      NEVER_CRITICAL,
    );

    expect([first, second].map(({ reactions }) => reactions.map(({ reactionType }) => reactionType))).toStrictEqual([
      [ReactionType.Swirl],
      [ReactionType.Swirl],
    ]);
    expect([first.reachingReactions, second.reachingReactions]).toStrictEqual([first.reactions, []]);
  });
});
