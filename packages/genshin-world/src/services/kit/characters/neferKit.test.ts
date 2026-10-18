import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { createNeferKitBehaviour, NEFER_CHARACTER_ID } from "#src/services/kit/characters/neferKit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const NEFER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, NEFER_CHARACTER_ID);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

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

  test("Nefer's elemental skill uses her own hits", () => {
    expect.hasAssertions();
    expect(NEFER_KIT.elementalSkill.hits).not.toStrictEqual(TRAVELER_KIT.elementalSkill.hits);
  });
});
