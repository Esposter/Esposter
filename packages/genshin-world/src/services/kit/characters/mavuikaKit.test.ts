import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import type { Combatant } from "#src/models/kit/Combatant";

import { Attribute } from "#src/models/character/Attribute";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { NIGHTSOUL_POINTS_ID } from "#src/services/kit/constants";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { countKitResource } from "#src/services/kit/effects/countKitResource";
import { createMavuikaKitBehaviour, MAVUIKA_CHARACTER_ID } from "#src/services/kit/characters/mavuikaKit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const MAVUIKA_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, MAVUIKA_CHARACTER_ID);

const createMavuikaCombatant = (constellationCount: number): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: MAVUIKA_CHARACTER_ID,
  constellationCount,
  elementalResonances: [],
  kit: MAVUIKA_KIT,
  level: 90,
  weaponType: WeaponType.Claymore,
});

describe(createMavuikaKitBehaviour, () => {
  test("reads each talent multiplier from its proud skill groups", () => {
    expect.hasAssertions();
    const multipliers = [
      ...MAVUIKA_KIT.normalAttacks.flatMap(({ hits }) => hits.map(({ talentMultiplier }) => talentMultiplier)),
      ...MAVUIKA_KIT.chargedAttack.hits.map(({ talentMultiplier }) => talentMultiplier),
      MAVUIKA_KIT.plungeCollision.talentMultiplier,
      takeOne(MAVUIKA_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(MAVUIKA_KIT.highPlunge.hits).talentMultiplier,
    ];
    const expectedMultipliers = [
      0.80035, 0.364799, 0.364799, 0.332232, 0.332232, 0.332232, 1.161929, 1.93844, 0.745878, 1.49144, 1.862889,
    ];
    expect(multipliers).toStrictEqual(expectedMultipliers);
  });

  test("the four strikes hit at their hitmarks, the second and third twice and thrice", () => {
    expect.hasAssertions();
    expect(
      MAVUIKA_KIT.normalAttacks.map(({ hits }) => hits.map(({ hitmarkSeconds }) => Math.round(hitmarkSeconds * 60))),
    ).toStrictEqual([[21], [14, 26], [28, 33, 39], [30]]);
    expect(MAVUIKA_KIT.normalAttacks.map(({ seconds }) => Math.round(seconds * 60))).toStrictEqual([40, 50, 59, 61]);
  });

  test("the charged attack hits at 79 frames of a 99-frame animation, costing 50 stamina", () => {
    expect.hasAssertions();
    expect(Math.round(takeOne(MAVUIKA_KIT.chargedAttack.hits).hitmarkSeconds * 60)).toBe(79);
    expect(Math.round(MAVUIKA_KIT.chargedAttack.seconds * 60)).toBe(99);
    expect(MAVUIKA_KIT.chargedAttackStamina).toBe(50);
  });

  test("the skill and burst have no hit yet, the skill cools for 15 seconds, and the burst can never be paid for", () => {
    expect.hasAssertions();
    expect(MAVUIKA_KIT.elementalSkill.hits).toStrictEqual([]);
    expect(MAVUIKA_KIT.elementalBurst.hits).toStrictEqual([]);
    expect(MAVUIKA_KIT.skillCooldownSeconds).toBe(15);
    expect(MAVUIKA_KIT.burstCooldownSeconds).toBe(18);
    expect(MAVUIKA_KIT.burstEnergyCost).toBe(Number.POSITIVE_INFINITY);
  });

  test("the low plunge lands at 37 frames and the high plunge at 41, with their gcsim poise", () => {
    expect.hasAssertions();
    expect(Math.round(takeOne(MAVUIKA_KIT.lowPlunge.hits).hitmarkSeconds * 60)).toBe(37);
    expect(takeOne(MAVUIKA_KIT.lowPlunge.hits).poiseDamage).toBe(150);
    expect(Math.round(takeOne(MAVUIKA_KIT.highPlunge.hits).hitmarkSeconds * 60)).toBe(41);
    expect(takeOne(MAVUIKA_KIT.highPlunge.hits).poiseDamage).toBe(200);
  });

  test("the skill enters the Nightsoul Blessing with 80 points, or 120 from Constellation 1, and drains five a second", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createMavuikaCombatant(0));
    MAVUIKA_KIT.elementalSkill.onStart?.(context);
    stepKitSeconds(context, 2);
    expect(countKitResource(context.kitEffectState.effects, MAVUIKA_CHARACTER_ID, NIGHTSOUL_POINTS_ID)).toBeCloseTo(70);
    const withC1 = createKitTestContext(createMavuikaCombatant(1));
    MAVUIKA_KIT.elementalSkill.onStart?.(withC1);
    expect(countKitResource(withC1.kitEffectState.effects, MAVUIKA_CHARACTER_ID, NIGHTSOUL_POINTS_ID)).toBe(120);
  });

  test("a skill press in the blessing refills its points to the maximum", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createMavuikaCombatant(0));
    MAVUIKA_KIT.elementalSkill.onStart?.(context);
    stepKitSeconds(context, 2);
    MAVUIKA_KIT.elementalSkill.onStart?.(context);
    expect(countKitResource(context.kitEffectState.effects, MAVUIKA_CHARACTER_ID, NIGHTSOUL_POINTS_ID)).toBe(80);
  });
});
