import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitHit } from "#src/models/kit/KitHit";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { AuraType } from "#src/models/combat/AuraType";
import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { LunarReactionType } from "#src/models/combat/LunarReactionType";
import { ReactionType } from "#src/models/combat/ReactionType";
import { StellarReactionType } from "#src/models/combat/StellarReactionType";
import { Element } from "#src/models/Element";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { applyElement } from "#src/services/combat/aura/applyElement";
import { getDamage } from "#src/services/combat/damage/getDamage";
import { getLunarDamage } from "#src/services/combat/damage/getLunarDamage";
import { getLunarReactionDamage } from "#src/services/combat/damage/getLunarReactionDamage";
import { getResistanceMultiplier } from "#src/services/combat/damage/getResistanceMultiplier";
import { getStellarConductCoefficient } from "#src/services/combat/damage/getStellarConductCoefficient";
import { getTransformativeDamage } from "#src/services/combat/damage/getTransformativeDamage";
import { addEnemyStatus } from "#src/services/enemy/addEnemyStatus";
import { computeEnemyStats } from "#src/services/enemy/computeEnemyStats";
import { ENEMY_LAUNCHED_STATUS_ID, ENEMY_STAGGER_SECONDS } from "#src/services/enemy/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { getEnemyKind } from "#src/services/enemy/getEnemyKind";
import { getEnemyResistance } from "#src/services/enemy/getEnemyResistance";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { RADIANCE_STELLAR_CONDUCT_STATUS_ID } from "#src/services/kit/constants";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { strikeEnemy } from "#src/services/kit/strikeEnemy";
import { createDeployedCombatant } from "#src/services/party/createDeployedCombatant.test";
import { ID_SEPARATOR, takeOne } from "@esposter/shared";
import { createSeededRandom } from "genshin-engine";
import { describe, expect, test, vi } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

// Gcsim gives the Traveler's skill hit the Wind element; these reaction tests need the element-less hit the record held before.
const elementlessSkillHit = (): KitHit => ({ ...takeOne(TRAVELER_KIT.elementalSkill.hits, 0), element: undefined });
const NEVER_CRITICAL = (): number => 1;

// Strikes an enemy with a hit from a combatant, its random source never critical unless one is given
const strikeEnemyWith = (enemy: Enemy, hit: KitHit, combatant: Combatant, random = NEVER_CRITICAL): void => {
  strikeEnemy(enemy, hit, combatant, createKitTestContext(combatant, { enemyTables, random }));
};

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
    applyElement(enemy.elementalState, Element.Cryo, 1, { auraDecayRateScale: 1 });
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

  const createCombatantWithCriticalRate = (elementalResonances: Combatant["elementalResonances"] = []): Combatant => ({
    ascension: 0,
    attributes: computeCharacterAttributes([
      { attribute: Attribute.Attack, value: ATTACK },
      { attribute: Attribute.CriticalDamage, value: 0.5 },
      { attribute: Attribute.CriticalRate, value: 0.1 },
    ]),
    characterId: CHARACTER_ID,
    constellationCount: 0,
    elementalResonances,
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
    const resonatedEnemy = createCryoEnemy();
    const unresonatedEnemy = createCryoEnemy();

    const resonatedCombatant = createCombatantWithCriticalRate([Element.Cryo]);
    const resonatedContext = createKitTestContext(resonatedCombatant, { enemyTables, random: () => ROLL });
    strikeEnemy(resonatedEnemy, TRAVELER_KIT.plungeCollision, resonatedCombatant, resonatedContext);
    const unresonatedCombatant = createCombatantWithCriticalRate([]);
    const unresonatedContext = createKitTestContext(unresonatedCombatant, { enemyTables, random: () => ROLL });
    strikeEnemy(unresonatedEnemy, TRAVELER_KIT.plungeCollision, unresonatedCombatant, unresonatedContext);

    expect([resonatedEnemy.health, unresonatedEnemy.health]).toStrictEqual([
      resonatedEnemy.maxHealth - damage(true),
      unresonatedEnemy.maxHealth - damage(false),
    ]);
  });

  test("adds the CRIT DMG a hit is given to the CRIT DMG its critical damage is priced from", () => {
    expect.hasAssertions();

    const CRITICAL_DAMAGE_BONUS = 0.5;
    const boostedEnemy = createSturdyEnemy();
    const plainEnemy = createSturdyEnemy();

    const boostedCombatant = createCombatantWithCriticalRate();
    const boostedContext = createKitTestContext(boostedCombatant, { enemyTables, random: () => 0 });
    strikeEnemy(
      boostedEnemy,
      { ...TRAVELER_KIT.plungeCollision, criticalDamageBonus: CRITICAL_DAMAGE_BONUS },
      boostedCombatant,
      boostedContext,
    );
    const plainCombatant = createCombatantWithCriticalRate();
    const plainContext = createKitTestContext(plainCombatant, { enemyTables, random: () => 0 });
    strikeEnemy(plainEnemy, TRAVELER_KIT.plungeCollision, plainCombatant, plainContext);

    expect(boostedEnemy.maxHealth - boostedEnemy.health).toBeGreaterThan(plainEnemy.maxHealth - plainEnemy.health);
  });

  test("adds the CRIT Rate a strike is given to the rate its CRIT roll is made against", () => {
    expect.hasAssertions();

    const ROLL = 0.2;
    const CRITICAL_RATE_BONUS = 0.2;
    const boostedEnemy = createSturdyEnemy();
    const plainEnemy = createSturdyEnemy();

    const boostedCombatant = createCombatantWithCriticalRate();
    const boostedContext = createKitTestContext(boostedCombatant, { enemyTables, random: () => ROLL });
    strikeEnemy(
      boostedEnemy,
      { ...TRAVELER_KIT.plungeCollision, criticalRateBonus: CRITICAL_RATE_BONUS },
      boostedCombatant,
      boostedContext,
    );
    const plainCombatant = createCombatantWithCriticalRate();
    const plainContext = createKitTestContext(plainCombatant, { enemyTables, random: () => ROLL });
    strikeEnemy(plainEnemy, TRAVELER_KIT.plungeCollision, plainCombatant, plainContext);

    expect(boostedEnemy.maxHealth - boostedEnemy.health).toBeGreaterThan(plainEnemy.maxHealth - plainEnemy.health);
  });

  test("lands a forced critical hit as a critical one whatever its striker's CRIT Rate rolls, and an unforced hit as the roll says", () => {
    expect.hasAssertions();

    const CRITICAL_DAMAGE = 0.5;
    const { talentMultiplier } = TRAVELER_KIT.plungeCollision;
    const combatant: Combatant = {
      ...createCombatant(),
      attributes: computeCharacterAttributes([
        { attribute: Attribute.Attack, value: ATTACK },
        { attribute: Attribute.CriticalDamage, value: CRITICAL_DAMAGE },
      ]),
    };
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
    const forcedEnemy = createSturdyEnemy();
    const unforcedEnemy = createSturdyEnemy();

    strikeEnemyWith(forcedEnemy, { ...TRAVELER_KIT.plungeCollision, isForcedCritical: true }, combatant);
    strikeEnemyWith(unforcedEnemy, TRAVELER_KIT.plungeCollision, combatant);

    expect([forcedEnemy.health, unforcedEnemy.health]).toStrictEqual([
      forcedEnemy.maxHealth - damage(true),
      unforcedEnemy.maxHealth - damage(false),
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
        const context = createKitTestContext(combatant, { enemyTables, random });
        strikeEnemy(enemy, TRAVELER_KIT.plungeCollision, combatant, context);
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

    const combatant = createCombatant();
    strikeEnemyWith(enemy, TRAVELER_KIT.plungeCollision, combatant);

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

    strikeEnemyWith(enemy, TRAVELER_KIT.plungeCollision, combatant);

    expect(enemy.health).toBeCloseTo(enemy.maxHealth - damage);
  });

  test("raises a normal attack's damage by the normal attack bonus its character carries", () => {
    expect.hasAssertions();

    const NORMAL_ATTACK_DAMAGE_BONUS = 0.5;
    const enemy = createSturdyEnemy();
    const kitHit = { ...TRAVELER_KIT.plungeCollision, attackTag: AttackTag.NormalAttack };
    const damage = getDamage({
      attackerLevel: LEVEL,
      damageBonus: NORMAL_ATTACK_DAMAGE_BONUS,
      defense,
      resistance: kind.physicalResistance,
      stat: ATTACK,
      talentMultiplier: kitHit.talentMultiplier,
    });
    const combatant = {
      ...createCombatant(),
      attributes: computeCharacterAttributes([
        { attribute: Attribute.Attack, value: ATTACK },
        { attribute: Attribute.NormalAttackDamageBonus, value: NORMAL_ATTACK_DAMAGE_BONUS },
      ]),
    };

    strikeEnemyWith(enemy, kitHit, combatant);

    expect(enemy.health).toBeCloseTo(enemy.maxHealth - damage);
  });

  test("raises a charged attack's damage by the charged attack bonus, and not by the normal attack bonus", () => {
    expect.hasAssertions();

    const CHARGED_ATTACK_DAMAGE_BONUS = 0.5;
    const enemy = createSturdyEnemy();
    const kitHit = { ...TRAVELER_KIT.plungeCollision, attackTag: AttackTag.ChargedAttack };
    const damage = getDamage({
      attackerLevel: LEVEL,
      damageBonus: CHARGED_ATTACK_DAMAGE_BONUS,
      defense,
      resistance: kind.physicalResistance,
      stat: ATTACK,
      talentMultiplier: kitHit.talentMultiplier,
    });
    const combatant = {
      ...createCombatant(),
      attributes: computeCharacterAttributes([
        { attribute: Attribute.Attack, value: ATTACK },
        { attribute: Attribute.NormalAttackDamageBonus, value: 0.25 },
        { attribute: Attribute.ChargedAttackDamageBonus, value: CHARGED_ATTACK_DAMAGE_BONUS },
      ]),
    };

    strikeEnemyWith(enemy, kitHit, combatant);

    expect(enemy.health).toBeCloseTo(enemy.maxHealth - damage);
  });

  test("leaves a skill's damage unchanged by the normal and charged attack bonuses its character carries", () => {
    expect.hasAssertions();

    const kitHit = { ...TRAVELER_KIT.plungeCollision, attackTag: AttackTag.ElementalSkill };
    const plainEnemy = createSturdyEnemy();
    const boostedEnemy = createSturdyEnemy();
    const plainCombatant = {
      ...createCombatant(),
      attributes: computeCharacterAttributes([{ attribute: Attribute.Attack, value: ATTACK }]),
    };
    const boostedCombatant = {
      ...createCombatant(),
      attributes: computeCharacterAttributes([
        { attribute: Attribute.Attack, value: ATTACK },
        { attribute: Attribute.NormalAttackDamageBonus, value: 0.5 },
        { attribute: Attribute.ChargedAttackDamageBonus, value: 0.5 },
      ]),
    };

    strikeEnemyWith(plainEnemy, kitHit, plainCombatant);
    strikeEnemyWith(boostedEnemy, kitHit, boostedCombatant);

    expect(boostedEnemy.health).toBeCloseTo(plainEnemy.health);
  });

  test("raises a plunging attack's damage by the plunging attack bonus its character carries, and leaves a normal attack's alone", () => {
    expect.hasAssertions();

    const PLUNGING_ATTACK_DAMAGE_BONUS = 0.5;
    const plungingHit = { ...TRAVELER_KIT.plungeCollision, attackTag: AttackTag.PlungingAttack };
    const normalHit = { ...TRAVELER_KIT.plungeCollision, attackTag: AttackTag.NormalAttack };
    const plungingBoostedCombatant = {
      ...createCombatant(),
      attributes: computeCharacterAttributes([
        { attribute: Attribute.Attack, value: ATTACK },
        { attribute: Attribute.PlungingAttackDamageBonus, value: PLUNGING_ATTACK_DAMAGE_BONUS },
      ]),
    };
    const plainEnemy = createSturdyEnemy();
    const plungingEnemy = createSturdyEnemy();
    const normalEnemy = createSturdyEnemy();

    const plainCombatant = createCombatant();
    strikeEnemyWith(plainEnemy, normalHit, plainCombatant);
    strikeEnemyWith(plungingEnemy, plungingHit, plungingBoostedCombatant);
    strikeEnemyWith(normalEnemy, normalHit, plungingBoostedCombatant);

    expect(plungingEnemy.health).toBeLessThan(plainEnemy.health);
    expect(normalEnemy.health).toBeCloseTo(plainEnemy.health);
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
    const plainCombatant = createCombatant(Element.Pyro);
    strikeEnemyWith(plainEnemy, kitHit, plainCombatant);
    strikeEnemyWith(boostedEnemy, kitHit, boostedCombatant);

    expect(boostedEnemy.maxHealth - boostedEnemy.health).toBeGreaterThan(plainEnemy.maxHealth - plainEnemy.health);
  });

  test("applies the element a hit deals over its character's own", () => {
    expect.hasAssertions();

    const enemy = createSturdyEnemy();
    const kitHit = { ...takeOne(TRAVELER_KIT.elementalSkill.hits, 0), element: Element.Hydro };
    const combatant = createCombatant(Element.Pyro);
    strikeEnemyWith(enemy, kitHit, combatant);

    expect(enemy.elementalState.auras.has(AuraType.Hydro)).toBe(true);
    expect(enemy.elementalState.auras.has(AuraType.Pyro)).toBe(false);
  });

  test("applies an element on the first hit of its internal cooldown, keyed by attacker and tag", () => {
    expect.hasAssertions();

    const enemy = createSturdyEnemy();
    const combatant = createCombatant(Element.Pyro);
    strikeEnemyWith(enemy, elementlessSkillHit(), combatant);

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
    const firstCombatant = createCombatant(Element.Hydro);
    strikeEnemyWith(enemy, kitHit, firstCombatant);
    enemy.elementalState.seconds = 3;
    const secondCombatant = createCombatant(Element.Hydro);
    strikeEnemyWith(enemy, kitHit, secondCombatant);

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

    const combatant = { ...createCombatant(), weaponType: WeaponType.Sword };
    strikeEnemyWith(enemy, kitHit, combatant);

    expect(enemy.elementalState.auras.has(AuraType.Freeze)).toBe(false);
    expect(enemy.health).toBeCloseTo(enemy.maxHealth - damage - shatterDamage);
  });

  test("amplifies a Hydro hit that Vaporizes a Pyro aura", () => {
    expect.hasAssertions();

    const enemy = createSturdyEnemy();
    const pyroCombatant = createCombatant(Element.Pyro);
    strikeEnemyWith(enemy, takeOne(TRAVELER_KIT.elementalBurst.hits, 0), pyroCombatant);
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

    const hydroCombatant = createCombatant(Element.Hydro);
    strikeEnemyWith(enemy, hydroHit, hydroCombatant);

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

    const combatant = createCombatant();
    strikeEnemyWith(enemy, TRAVELER_KIT.plungeCollision, combatant);

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

    const combatant = createCombatant();
    strikeEnemyWith(enemy, hit, combatant);

    expect(enemy.health).toBeCloseTo(enemy.maxHealth - damage);
  });

  test("gives the enemy a hit's status before the hit's damage is taken", () => {
    expect.hasAssertions();

    const enemy = createSturdyEnemy();
    const hit: KitHit = {
      ...TRAVELER_KIT.plungeCollision,
      enemyStatus: () => ({ damageTakenBonus: 0.42, id: "omen", secondsRemaining: 4 }),
    };

    const combatant = createCombatant();
    strikeEnemyWith(enemy, hit, combatant);

    expect(enemy.statuses).toStrictEqual([{ damageTakenBonus: 0.42, id: "omen", secondsRemaining: 4 }]);
  });

  test("a launching hit that staggers an enemy leaves it launched while the stagger lasts", () => {
    expect.hasAssertions();

    const enemy = createSturdyEnemy();
    const hit: KitHit = { ...TRAVELER_KIT.plungeCollision, isLaunching: true, poiseDamage: STURDY_HEALTH };
    const combatant = createCombatant();
    const context = createKitTestContext(combatant, { enemyTables, random: NEVER_CRITICAL });

    strikeEnemy(enemy, hit, combatant, context);

    expect(enemy.statuses).toStrictEqual([
      { damageTakenBonus: 0, id: ENEMY_LAUNCHED_STATUS_ID, secondsRemaining: ENEMY_STAGGER_SECONDS },
    ]);
  });

  test.each<[string, Pick<KitHit, "isLaunching" | "poiseDamage">]>([
    ["a launching hit that leaves its poise standing", { isLaunching: true, poiseDamage: 0 }],
    ["a hit that staggers it without launching", { poiseDamage: STURDY_HEALTH }],
  ])("%s leaves an enemy unlaunched", (_title, launch) => {
    expect.hasAssertions();

    const enemy = createSturdyEnemy();
    const combatant = createCombatant();
    const context = createKitTestContext(combatant, { enemyTables, random: NEVER_CRITICAL });

    strikeEnemy(enemy, { ...TRAVELER_KIT.plungeCollision, ...launch }, combatant, context);

    expect(enemy.statuses).toStrictEqual([]);
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

    strikeEnemyWith(enemy, hit, combatant);

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

    const context = createKitTestContext(combatant, { enemyTables, random: NEVER_CRITICAL });
    strikeEnemy(enemy, hit, combatant, context, {
      baseDamageBonusMap: { [LunarReactionType.LunarBloom]: BASE_DAMAGE_BONUS },
      lunarReactionTypes: [LunarReactionType.LunarBloom],
      reactionBonus: REACTION_BONUS,
    });

    expect(enemy.health).toBeCloseTo(enemy.maxHealth - damage);
  });

  test("a direct Lunar hit takes the party reaction bonuses its Lunar reaction takes and its own CRIT DMG bonus, with its Elevation last", () => {
    expect.hasAssertions();

    const ELEMENTAL_MASTERY = 400;
    const BASE_DAMAGE_BONUS = 0.07;
    const REACTION_BONUS = 0.18;
    const PARTY_DAMAGE_BONUS = 0.2;
    const PARTY_CRITICAL_DAMAGE_BONUS = 0.5;
    const ELEVATION_BONUS = 0.15;
    const HIT_CRITICAL_DAMAGE_BONUS = 0.3;
    const enemy = createSturdyEnemy();
    const getPartyReactionBonus = vi.fn<NonNullable<Kit["getPartyReactionBonus"]>>(() => ({
      criticalDamageBonus: PARTY_CRITICAL_DAMAGE_BONUS,
      criticalRateBonus: 1,
      damageBonus: PARTY_DAMAGE_BONUS,
      elevationBonus: ELEVATION_BONUS,
    }));
    const combatant: Combatant = {
      ...createCombatant(),
      attributes: computeCharacterAttributes([
        { attribute: Attribute.Attack, value: ATTACK },
        { attribute: Attribute.ElementalMastery, value: ELEMENTAL_MASTERY },
      ]),
      kit: { ...TRAVELER_KIT, getPartyReactionBonus },
    };
    const hit: KitHit = {
      criticalDamageBonus: HIT_CRITICAL_DAMAGE_BONUS,
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
        REACTION_BONUS + PARTY_DAMAGE_BONUS,
      ) *
      getResistanceMultiplier(getEnemyResistance(kind, enemy, Element.Dendro)) *
      (1 +
        combatant.attributes.attributeTotalMap[Attribute.CriticalDamage] +
        PARTY_CRITICAL_DAMAGE_BONUS +
        HIT_CRITICAL_DAMAGE_BONUS) *
      (1 + ELEVATION_BONUS);
    const context = createKitTestContext(combatant, { enemyTables, random: () => 0.5 });

    strikeEnemy(enemy, hit, combatant, context, {
      baseDamageBonusMap: { [LunarReactionType.LunarBloom]: BASE_DAMAGE_BONUS },
      lunarReactionTypes: [LunarReactionType.LunarBloom],
      reactionBonus: REACTION_BONUS,
    });

    expect(enemy.health).toBeCloseTo(enemy.maxHealth - damage);
    expect(getPartyReactionBonus).toHaveBeenCalledExactlyOnceWith(
      createDeployedCombatant(combatant, { isOnField: true }),
      { combatant, element: Element.Dendro, enemy, reactionType: LunarReactionType.LunarBloom },
      context,
    );
  });

  test.each([
    ["Stellar-Conduct", StellarReactionType.StellarConduct, getStellarConductCoefficient(3)],
    ["Stellar Swirl", StellarReactionType.StellarSwirl, 1],
  ])(
    "prices a direct %s hit by the Glimmer formula at its coefficient by the Starlight Prism's count its striker carries, with no Defence",
    (_title, stellarReactionType, coefficient) => {
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
          { attribute: Attribute.StellarGlimmerReactionDamageBonus, value: REACTION_BONUS },
        ]),
        kit: {
          ...TRAVELER_KIT,
          stellarJubilee: { getBaseDamageBonus: () => BASE_DAMAGE_BONUS, stellarReactionTypes: [] },
        },
      };
      const hit: KitHit = {
        element: Element.Cryo,
        hitArea: TRAVELER_KIT.plungeCollision.hitArea,
        hitmarkSeconds: 0,
        poiseDamage: 0,
        stellarReactionType,
        talentMultiplier: 2,
      };
      const damage =
        getLunarReactionDamage(coefficient, 2 * ATTACK, ELEMENTAL_MASTERY, BASE_DAMAGE_BONUS, REACTION_BONUS) *
        getResistanceMultiplier(getEnemyResistance(kind, enemy, Element.Cryo));
      const context = createKitTestContext(combatant, { enemyTables, random: NEVER_CRITICAL });
      addKitStatus(context.kitEffectState, CHARACTER_ID, {
        id: RADIANCE_STELLAR_CONDUCT_STATUS_ID,
        secondsRemaining: 4,
        stacks: 3,
      });

      strikeEnemy(enemy, hit, combatant, context);

      expect(enemy.health).toBeCloseTo(enemy.maxHealth - damage);
    },
  );

  test("a direct Stellar-Conduct hit takes the party reaction bonuses Stellar-Conduct takes, and its Elevation last", () => {
    expect.hasAssertions();

    const PARTY_DAMAGE_BONUS = 0.2;
    const PARTY_CRITICAL_DAMAGE_BONUS = 0.5;
    const ELEVATION_BONUS = 0.15;
    const enemy = createSturdyEnemy();
    const getPartyReactionBonus = vi.fn<NonNullable<Kit["getPartyReactionBonus"]>>(() => ({
      criticalDamageBonus: PARTY_CRITICAL_DAMAGE_BONUS,
      criticalRateBonus: 1,
      damageBonus: PARTY_DAMAGE_BONUS,
      elevationBonus: ELEVATION_BONUS,
    }));
    const combatant: Combatant = { ...createCombatant(), kit: { ...TRAVELER_KIT, getPartyReactionBonus } };
    const hit: KitHit = {
      element: Element.Electro,
      hitArea: TRAVELER_KIT.plungeCollision.hitArea,
      hitmarkSeconds: 0,
      poiseDamage: 0,
      stellarReactionType: StellarReactionType.StellarConduct,
      talentMultiplier: 2,
    };
    const damage =
      getLunarReactionDamage(1, 2 * ATTACK, 0, 0, PARTY_DAMAGE_BONUS) *
      getResistanceMultiplier(getEnemyResistance(kind, enemy, Element.Electro)) *
      (1 + combatant.attributes.attributeTotalMap[Attribute.CriticalDamage] + PARTY_CRITICAL_DAMAGE_BONUS) *
      (1 + ELEVATION_BONUS);
    const context = createKitTestContext(combatant, { enemyTables, random: () => 0.5 });

    strikeEnemy(enemy, hit, combatant, context);

    expect(enemy.health).toBeCloseTo(enemy.maxHealth - damage);
    expect(getPartyReactionBonus).toHaveBeenCalledExactlyOnceWith(
      createDeployedCombatant(combatant, { isOnField: true }),
      { combatant, element: Element.Electro, enemy, reactionType: StellarReactionType.StellarConduct },
      context,
    );
  });

  test("a direct Stellar hit takes its own CRIT DMG bonus on a critical hit, as a direct Lunar hit does", () => {
    expect.hasAssertions();

    const HIT_CRITICAL_DAMAGE_BONUS = 0.2;
    const enemy = createSturdyEnemy();
    const combatant: Combatant = createCombatant();
    const hit: KitHit = {
      criticalDamageBonus: HIT_CRITICAL_DAMAGE_BONUS,
      element: Element.Electro,
      hitArea: TRAVELER_KIT.plungeCollision.hitArea,
      hitmarkSeconds: 0,
      isForcedCritical: true,
      poiseDamage: 0,
      stellarReactionType: StellarReactionType.StellarConduct,
      talentMultiplier: 2,
    };
    const damage =
      getLunarReactionDamage(1, 2 * ATTACK, 0, 0, 0) *
      getResistanceMultiplier(getEnemyResistance(kind, enemy, Element.Electro)) *
      (1 + combatant.attributes.attributeTotalMap[Attribute.CriticalDamage] + HIT_CRITICAL_DAMAGE_BONUS);
    const context = createKitTestContext(combatant, { enemyTables, random: () => 0.5 });

    strikeEnemy(enemy, hit, combatant, context);

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

    const combatant = createCombatant();
    strikeEnemyWith(enemy, TRAVELER_KIT.plungeCollision, combatant);

    expect(enemy.health).toBeCloseTo(enemy.maxHealth - damage);
  });

  test("takes an enemy's statuses' DEF reduction off the defence a hit reads", () => {
    expect.hasAssertions();

    const DEFENSE_REDUCTION = 0.15;
    const enemy = createSturdyEnemy();
    addEnemyStatus(enemy, { damageTakenBonus: 0, defenseReduction: DEFENSE_REDUCTION, id: "", secondsRemaining: 1 });
    const damage = getDamage({
      attackerLevel: LEVEL,
      defense,
      defenseReduction: DEFENSE_REDUCTION,
      resistance: kind.physicalResistance,
      stat: ATTACK,
      talentMultiplier: TRAVELER_KIT.plungeCollision.talentMultiplier,
    });

    const combatant = createCombatant();
    strikeEnemyWith(enemy, TRAVELER_KIT.plungeCollision, combatant);

    expect(enemy.health).toBeCloseTo(enemy.maxHealth - damage);
  });

  test("takes Superconduct's 40% off the Physical RES a physical hit then reads", () => {
    expect.hasAssertions();

    const enemy = createCryoEnemy();
    const electroHit = { ...takeOne(TRAVELER_KIT.elementalSkill.hits, 0), element: Element.Electro };
    const electroCombatant = createCombatant();
    strikeEnemyWith(enemy, electroHit, electroCombatant);
    const healthBeforePhysical = enemy.health;
    const damage = getDamage({
      attackerLevel: LEVEL,
      defense,
      resistance: kind.physicalResistance - 0.4,
      stat: ATTACK,
      talentMultiplier: TRAVELER_KIT.plungeCollision.talentMultiplier,
    });

    const physicalCombatant = createCombatant();
    strikeEnemyWith(enemy, TRAVELER_KIT.plungeCollision, physicalCombatant);

    expect(healthBeforePhysical - enemy.health).toBeCloseTo(damage);
  });

  test("deals the enemy the poise of an Overloaded it triggers, breaking a minion's from a hit of none", () => {
    expect.hasAssertions();

    const enemy = createSturdyEnemy();
    enemy.elementalState.auras.set(AuraType.Pyro, { decayRate: 0, gauge: 4, isImmutable: true });
    const unreactedEnemy = createSturdyEnemy();
    const kitHit = { ...elementlessSkillHit(), poiseDamage: 0 };
    const enemyCombatant = createCombatant(Element.Electro);
    strikeEnemyWith(enemy, kitHit, enemyCombatant);
    const unreactedCombatant = createCombatant(Element.Electro);
    strikeEnemyWith(unreactedEnemy, kitHit, unreactedCombatant);

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

    const combatant = createCombatant(Element.Electro);
    strikeEnemyWith(enemy, kitHit, combatant);

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

    strikeEnemyWith(enemy, skillHit, combatant);
    const healthBeforeBurst = enemy.health;
    enemy.elementalState.seconds = 0.2;
    strikeEnemyWith(enemy, burstHit, combatant);

    expect(enemy.maxHealth - healthBeforeBurst).toBeCloseTo(hitDamage(skillHit.talentMultiplier) + overloadedDamage);
    expect(healthBeforeBurst - enemy.health).toBeCloseTo(hitDamage(burstHit.talentMultiplier));
  });

  test("returns a Swirl that lands to reach round the enemy, and none for a Swirl within a tenth of a second of it", () => {
    expect.hasAssertions();

    const enemy = createSturdyEnemy();
    enemy.elementalState.auras.set(AuraType.Pyro, { decayRate: 0, gauge: 4, isImmutable: true });
    const combatant = createCombatant(Element.Anemo);
    const firstContext = createKitTestContext(combatant, { enemyTables, random: NEVER_CRITICAL });
    const first = strikeEnemy(enemy, elementlessSkillHit(), combatant, firstContext);
    const secondContext = createKitTestContext(combatant, { enemyTables, random: NEVER_CRITICAL });
    const second = strikeEnemy(enemy, takeOne(TRAVELER_KIT.elementalBurst.hits, 0), combatant, secondContext);

    expect([first, second].map(({ reactions }) => reactions.map(({ reactionType }) => reactionType))).toStrictEqual([
      [ReactionType.Swirl],
      [ReactionType.Swirl],
    ]);
    expect([first.reachingReactions, second.reachingReactions]).toStrictEqual([first.reactions, []]);
  });

  test("a hit's CRIT Rate bonus raises the roll it is made against", () => {
    expect.hasAssertions();

    const boostedCombatant = createCombatant();
    const boostedContext = createKitTestContext(boostedCombatant, { enemyTables, random: () => 0.5 });
    const boosted = strikeEnemy(
      createSturdyEnemy(),
      { ...TRAVELER_KIT.plungeCollision, criticalRateBonus: 0.6 },
      boostedCombatant,
      boostedContext,
    );
    const plainCombatant = createCombatant();
    const plainContext = createKitTestContext(plainCombatant, { enemyTables, random: () => 0.5 });
    const plain = strikeEnemy(createSturdyEnemy(), TRAVELER_KIT.plungeCollision, plainCombatant, plainContext);

    expect(boosted.isCritical).toBe(true);
    expect(plain.isCritical).toBe(false);
  });
});
