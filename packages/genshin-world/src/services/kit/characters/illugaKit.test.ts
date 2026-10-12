import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { createIllugaKitBehaviour, ILLUGA_CHARACTER_ID } from "#src/services/kit/characters/illugaKit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const ILLUGA_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, ILLUGA_CHARACTER_ID);

describe(createIllugaKitBehaviour, () => {
  test("reads each talent multiplier from its proud skill groups", () => {
    expect.hasAssertions();
    expect([
      takeOne(takeOne(ILLUGA_KIT.normalAttacks).hits).talentMultiplier,
      takeOne(ILLUGA_KIT.chargedAttack.hits).talentMultiplier,
      ILLUGA_KIT.plungeCollision.talentMultiplier,
      takeOne(ILLUGA_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(ILLUGA_KIT.highPlunge.hits).talentMultiplier,
    ]).toStrictEqual([0.473662, 1.11026, 0.639324, 1.278377, 1.596762]);
  });

  test("costs 60 energy for its burst, cooling for 15 seconds, and 25 stamina for its charged attack, its skill cooling for 15 seconds", () => {
    expect.hasAssertions();
    expect(ILLUGA_KIT.burstEnergyCost).toBe(60);
    expect(ILLUGA_KIT.burstCooldownSeconds).toBe(15);
    expect(ILLUGA_KIT.chargedAttackStamina).toBe(25);
    expect(ILLUGA_KIT.skillCooldownSeconds).toBe(15);
  });
});
