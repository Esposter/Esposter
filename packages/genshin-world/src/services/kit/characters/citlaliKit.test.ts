import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { CITLALI_CHARACTER_ID, createCitlaliKitBehaviour } from "#src/services/kit/characters/citlaliKit";
import { NIGHTSOUL_POINTS_ID } from "#src/services/kit/constants";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { countKitResource } from "#src/services/kit/effects/countKitResource";
import { hasKitNightsoulBlessing } from "#src/services/kit/effects/hasKitNightsoulBlessing";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const createCitlaliCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: CITLALI_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: CITLALI_KIT,
  level: 90,
});

const CITLALI_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, CITLALI_CHARACTER_ID);

describe(createCitlaliKitBehaviour, () => {
  test("reads each talent multiplier from its proud skill groups", () => {
    expect.hasAssertions();
    expect([
      ...CITLALI_KIT.normalAttacks.map(({ hits }) => takeOne(hits).talentMultiplier),
      takeOne(CITLALI_KIT.chargedAttack.hits).talentMultiplier,
      takeOne(CITLALI_KIT.elementalSkill.hits).talentMultiplier,
      takeOne(CITLALI_KIT.elementalBurst.hits).talentMultiplier,
      CITLALI_KIT.plungeCollision.talentMultiplier,
      takeOne(CITLALI_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(CITLALI_KIT.highPlunge.hits).talentMultiplier,
    ]).toStrictEqual([0.434072, 0.388136, 0.537712, 0.992, 0.7296, 5.376, 0.568288, 1.136335, 1.419344]);
  });

  test("the strikes land 10 frames after their hitmarks, at 16, 16 and 36", () => {
    expect.hasAssertions();
    expect(CITLALI_KIT.normalAttacks.map(({ hits }) => Math.round(takeOne(hits).hitmarkSeconds * 60))).toStrictEqual([
      26, 26, 46,
    ]);
    expect(CITLALI_KIT.normalAttacks.map(({ seconds }) => Math.round(seconds * 60))).toStrictEqual([38, 39, 52]);
  });

  test("the charged attack hits at 50 frames of a 56-frame animation, costing 50 stamina", () => {
    expect.hasAssertions();
    expect(Math.round(takeOne(CITLALI_KIT.chargedAttack.hits).hitmarkSeconds * 60)).toBe(50);
    expect(Math.round(CITLALI_KIT.chargedAttack.seconds * 60)).toBe(56);
    expect(CITLALI_KIT.chargedAttackStamina).toBe(50);
  });

  test("the skill's hit lands at 20 frames and cools for 16 seconds", () => {
    expect.hasAssertions();
    expect(Math.round(takeOne(CITLALI_KIT.elementalSkill.hits).hitmarkSeconds * 60)).toBe(20);
    expect(CITLALI_KIT.skillCooldownSeconds).toBe(16);
  });

  test("ice Storm hits at 118 frames, costing 60 energy and cooling for 15 seconds", () => {
    expect.hasAssertions();
    expect(Math.round(takeOne(CITLALI_KIT.elementalBurst.hits).hitmarkSeconds * 60)).toBe(118);
    expect(CITLALI_KIT.burstEnergyCost).toBe(60);
    expect(CITLALI_KIT.burstCooldownSeconds).toBe(15);
  });

  test("the low plunge and the high plunge land at Bennett's hitmarks, 36 and 38 frames", () => {
    expect.hasAssertions();
    expect(takeOne(CITLALI_KIT.lowPlunge.hits).hitmarkSeconds).toBe(36 / 60);
    expect(takeOne(CITLALI_KIT.highPlunge.hits).hitmarkSeconds).toBe(38 / 60);
  });

  test("the skill's press enters the Nightsoul Blessing with its points plus 24, which last twenty seconds", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createCitlaliCombatant());
    CITLALI_KIT.elementalSkill.onStart?.(context);
    expect(countKitResource(context.kitEffectState.effects, CITLALI_CHARACTER_ID, NIGHTSOUL_POINTS_ID)).toBe(24);
    stepKitSeconds(context, 19.5);
    expect(hasKitNightsoulBlessing(context.kitEffectState.effects, CITLALI_CHARACTER_ID)).toBe(true);
    stepKitSeconds(context, 0.6);
    expect(hasKitNightsoulBlessing(context.kitEffectState.effects, CITLALI_CHARACTER_ID)).toBe(false);
  });

  test("the burst gains 24 Nightsoul points", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createCitlaliCombatant());
    CITLALI_KIT.elementalBurst.onStart?.(context);
    expect(countKitResource(context.kitEffectState.effects, CITLALI_CHARACTER_ID, NIGHTSOUL_POINTS_ID)).toBe(24);
  });
});
