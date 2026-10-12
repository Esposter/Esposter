import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { createLinneaKitBehaviour, LINNEA_CHARACTER_ID } from "#src/services/kit/characters/linneaKit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const LINNEA_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, LINNEA_CHARACTER_ID);

describe(createLinneaKitBehaviour, () => {
  test("reads each talent multiplier from its proud skill groups", () => {
    expect.hasAssertions();
    expect([
      takeOne(takeOne(LINNEA_KIT.normalAttacks).hits).talentMultiplier,
      takeOne(LINNEA_KIT.chargedAttack.hits).talentMultiplier,
      LINNEA_KIT.plungeCollision.talentMultiplier,
      takeOne(LINNEA_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(LINNEA_KIT.highPlunge.hits).talentMultiplier,
    ]).toStrictEqual([0.589969, 1.24, 0.568288, 1.136335, 1.419344]);
  });

  test("costs 60 energy for its burst, cooling for 15 seconds, and 0 stamina for its charged attack, its skill cooling for 18 seconds", () => {
    expect.hasAssertions();
    expect(LINNEA_KIT.burstEnergyCost).toBe(60);
    expect(LINNEA_KIT.burstCooldownSeconds).toBe(15);
    expect(LINNEA_KIT.chargedAttackStamina).toBe(0);
    expect(LINNEA_KIT.skillCooldownSeconds).toBe(18);
  });
});
