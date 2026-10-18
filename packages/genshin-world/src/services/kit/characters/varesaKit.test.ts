import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { NIGHTSOUL_BLESSING_STATUS_ID, NIGHTSOUL_POINTS_ID } from "#src/services/kit/constants";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { countKitResource } from "#src/services/kit/effects/countKitResource";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { hasKitNightsoulBlessing } from "#src/services/kit/effects/hasKitNightsoulBlessing";
import { createVaresaKitBehaviour, VARESA_CHARACTER_ID } from "#src/services/kit/characters/varesaKit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const VARESA_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, VARESA_CHARACTER_ID);

const createVaresaCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: VARESA_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: VARESA_KIT,
  level: 90,
});

describe(createVaresaKitBehaviour, () => {
  test("reads each talent multiplier from its proud skill groups", () => {
    expect.hasAssertions();
    const multipliers = [
      ...VARESA_KIT.normalAttacks.flatMap(({ hits }) => hits.map(({ talentMultiplier }) => talentMultiplier)),
      ...VARESA_KIT.chargedAttack.hits.map(({ talentMultiplier }) => talentMultiplier),
      VARESA_KIT.plungeCollision.talentMultiplier,
      takeOne(VARESA_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(VARESA_KIT.highPlunge.hits).talentMultiplier,
      takeOne(VARESA_KIT.elementalSkill.hits).talentMultiplier,
      takeOne(VARESA_KIT.elementalBurst.hits).talentMultiplier,
    ];
    expect(multipliers).toStrictEqual([
      0.467784, 0.40028, 0.563128, 0.8928, 0.745878, 1.49144, 1.862889, 0.7448, 3.4512,
    ]);
  });

  test("the three strikes hit at their hitmarks and cancel into a walk at their table frames", () => {
    expect.hasAssertions();
    expect(
      VARESA_KIT.normalAttacks.map(({ hits }) => hits.map(({ hitmarkSeconds }) => Math.round(hitmarkSeconds * 60))),
    ).toStrictEqual([[23], [7], [33]]);
    expect(VARESA_KIT.normalAttacks.map(({ seconds }) => Math.round(seconds * 60))).toStrictEqual([49, 28, 59]);
  });

  test("the charged attack hits at 69 frames of a 143-frame animation, costing 50 stamina", () => {
    expect.hasAssertions();
    expect(Math.round(takeOne(VARESA_KIT.chargedAttack.hits).hitmarkSeconds * 60)).toBe(69);
    expect(Math.round(VARESA_KIT.chargedAttack.seconds * 60)).toBe(143);
    expect(VARESA_KIT.chargedAttackStamina).toBe(50);
  });

  test("the skill has two charges on a 9-second cooldown, and the burst costs 70 energy for 18 seconds", () => {
    expect.hasAssertions();
    expect(VARESA_KIT.elementalSkillCharges).toBe(2);
    expect(VARESA_KIT.skillCooldownSeconds).toBe(9);
    expect(VARESA_KIT.burstCooldownSeconds).toBe(18);
    expect(VARESA_KIT.burstEnergyCost).toBe(70);
  });

  test("the low plunge lands at 37 frames and the high plunge at 38, with the collision at 31", () => {
    expect.hasAssertions();
    expect(Math.round(takeOne(VARESA_KIT.lowPlunge.hits).hitmarkSeconds * 60)).toBe(37);
    expect(Math.round(takeOne(VARESA_KIT.highPlunge.hits).hitmarkSeconds * 60)).toBe(38);
    expect(Math.round(VARESA_KIT.plungeCollision.hitmarkSeconds * 60)).toBe(31);
  });

  test("the skill's press gains 20 Nightsoul points, which stop at 40", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createVaresaCombatant());
    VARESA_KIT.elementalSkill.onStart?.(context);
    expect(countKitResource(context.kitEffectState.effects, VARESA_CHARACTER_ID, NIGHTSOUL_POINTS_ID)).toBe(20);
    VARESA_KIT.elementalSkill.onStart?.(context);
    VARESA_KIT.elementalSkill.onStart?.(context);
    expect(countKitResource(context.kitEffectState.effects, VARESA_CHARACTER_ID, NIGHTSOUL_POINTS_ID)).toBe(40);
  });

  test("a plunge gains 25 Nightsoul points, and filling them to 40 enters the Blessing for 15 seconds", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createVaresaCombatant());
    VARESA_KIT.highPlunge.onStart?.(context);
    expect(hasKitNightsoulBlessing(context.kitEffectState.effects, VARESA_CHARACTER_ID)).toBe(false);
    VARESA_KIT.lowPlunge.onStart?.(context);
    expect(hasKitNightsoulBlessing(context.kitEffectState.effects, VARESA_CHARACTER_ID)).toBe(true);
    stepKitSeconds(context, 14.9);
    expect(hasKitNightsoulBlessing(context.kitEffectState.effects, VARESA_CHARACTER_ID)).toBe(true);
    stepKitSeconds(context, 0.2);
    expect(
      findKitStatus(context.kitEffectState.effects, VARESA_CHARACTER_ID, NIGHTSOUL_BLESSING_STATUS_ID),
    ).toBeUndefined();
  });

  test("the burst fills her Nightsoul points to 40 and enters the Blessing", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createVaresaCombatant());
    VARESA_KIT.elementalBurst.onStart?.(context);
    expect(countKitResource(context.kitEffectState.effects, VARESA_CHARACTER_ID, NIGHTSOUL_POINTS_ID)).toBe(40);
    expect(hasKitNightsoulBlessing(context.kitEffectState.effects, VARESA_CHARACTER_ID)).toBe(true);
  });
});
