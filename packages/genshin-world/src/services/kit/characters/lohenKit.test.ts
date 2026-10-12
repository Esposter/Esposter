import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { createLohenKitBehaviour, LOHEN_CHARACTER_ID } from "#src/services/kit/characters/lohenKit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const LOHEN_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, LOHEN_CHARACTER_ID);

describe(createLohenKitBehaviour, () => {
  test("reads each talent multiplier from its proud skill groups", () => {
    expect.hasAssertions();
    expect([
      takeOne(takeOne(LOHEN_KIT.normalAttacks).hits).talentMultiplier,
      takeOne(LOHEN_KIT.chargedAttack.hits).talentMultiplier,
      LOHEN_KIT.plungeCollision.talentMultiplier,
      takeOne(LOHEN_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(LOHEN_KIT.highPlunge.hits).talentMultiplier,
    ]).toStrictEqual([0.539917, 0.65876, 0.639324, 1.278377, 1.596762]);
  });

  test("costs 60 energy for its burst, cooling for 15 seconds, and 25 stamina for its charged attack, its skill cooling for 18 seconds", () => {
    expect.hasAssertions();
    expect(LOHEN_KIT.burstEnergyCost).toBe(60);
    expect(LOHEN_KIT.burstCooldownSeconds).toBe(15);
    expect(LOHEN_KIT.chargedAttackStamina).toBe(25);
    expect(LOHEN_KIT.skillCooldownSeconds).toBe(18);
  });
});
