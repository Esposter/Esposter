import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { CITLALI_CHARACTER_ID, createCitlaliKitBehaviour } from "#src/services/kit/characters/citlaliKit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

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

  test("the low plunge and the high plunge read their proud multipliers at zero seconds", () => {
    expect.hasAssertions();
    expect(takeOne(CITLALI_KIT.lowPlunge.hits).hitmarkSeconds).toBe(0);
    expect(takeOne(CITLALI_KIT.highPlunge.hits).hitmarkSeconds).toBe(0);
  });
});
