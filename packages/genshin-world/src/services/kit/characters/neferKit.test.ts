import type { Combatant } from "#src/models/kit/Combatant";
import { Attribute } from "#src/models/character/Attribute";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createNeferKitBehaviour, NEFER_CHARACTER_ID } from "#src/services/kit/characters/neferKit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const NEFER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, NEFER_CHARACTER_ID);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

const createCombatant = (elementalMastery: number): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.ElementalMastery, value: elementalMastery }]),
  characterId: NEFER_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: NEFER_KIT,
  level: 90,
});

describe(createNeferKitBehaviour, () => {
  test("reads each talent multiplier from its proud skill groups", () => {
    expect.hasAssertions();
    expect([
      takeOne(takeOne(NEFER_KIT.normalAttacks).hits).talentMultiplier,
      takeOne(NEFER_KIT.chargedAttack.hits).talentMultiplier,
      NEFER_KIT.plungeCollision.talentMultiplier,
      takeOne(NEFER_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(NEFER_KIT.highPlunge.hits).talentMultiplier,
    ]).toStrictEqual([0.380712, 1.3088, 0.568288, 1.136335, 1.419344]);
  });

  test("costs 60 energy for its burst, cooling for 15 seconds, and 50 stamina for its charged attack, its skill cooling for 9 seconds", () => {
    expect.hasAssertions();
    expect(NEFER_KIT.burstEnergyCost).toBe(60);
    expect(NEFER_KIT.burstCooldownSeconds).toBe(15);
    expect(NEFER_KIT.chargedAttackStamina).toBe(50);
    expect(NEFER_KIT.skillCooldownSeconds).toBe(9);
  });

  test("nefer's elemental skill uses her own hits", () => {
    expect.hasAssertions();
    expect(NEFER_KIT.elementalSkill.hits).not.toStrictEqual(TRAVELER_KIT.elementalSkill.hits);
  });

  test("her Moonsign Benediction adds 0.0175% Base DMG Bonus a point of Elemental Mastery to Lunar-Bloom, at most 14%", () => {
    expect.hasAssertions();
    expect(
      [400, 1000].map((elementalMastery) =>
        createNeferKitBehaviour().moonsignBenediction?.getBaseDamageBonus?.(createCombatant(elementalMastery)),
      ),
    ).toStrictEqual([expect.closeTo(0.07), 0.14]);
  });
});
