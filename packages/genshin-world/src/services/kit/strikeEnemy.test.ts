import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";

import { Attribute } from "#src/models/character/Attribute";
import { AuraType } from "#src/models/combat/AuraType";
import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { ReactionType } from "#src/models/combat/ReactionType";
import { Element } from "#src/models/Element";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { getDamage } from "#src/services/combat/damage/getDamage";
import { getTransformativeDamage } from "#src/services/combat/damage/getTransformativeDamage";
import { computeEnemyStats } from "#src/services/enemy/computeEnemyStats";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { getEnemyKind } from "#src/services/enemy/getEnemyKind";
import { TRAVELER_KIT } from "#src/services/kit/constants";
import { strikeEnemy } from "#src/services/kit/strikeEnemy";
import { ID_SEPARATOR, takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const CHARACTER_ID = 1;
const LEVEL = 90;
const ATTACK = 100;
const NEVER_CRITICAL = (): number => 1;
const STURDY_HEALTH = 1e9;
const kind = getEnemyKind(ENEMY_CAMP_MEMBER.enemyKindId);
const { defense } = computeEnemyStats(kind, ENEMY_CAMP_MEMBER.level);

const createSturdyEnemy = (): Enemy => ({
  ...createEnemy(ENEMY_CAMP_MEMBER, ""),
  health: STURDY_HEALTH,
  maxHealth: STURDY_HEALTH,
});

const createCombatant = (element?: Element): Combatant => ({
  attributes: computeCharacterAttributes([{ attribute: Attribute.Attack, value: ATTACK }]),
  characterId: CHARACTER_ID,
  element,
  kit: TRAVELER_KIT,
  level: LEVEL,
});

describe(strikeEnemy, () => {
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
});
