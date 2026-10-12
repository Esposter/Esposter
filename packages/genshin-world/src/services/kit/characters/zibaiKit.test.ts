import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { createZibaiKitBehaviour, ZIBAI_CHARACTER_ID } from "#src/services/kit/characters/zibaiKit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const ZIBAI_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, ZIBAI_CHARACTER_ID);

describe(createZibaiKitBehaviour, () => {
  test("reads each talent multiplier from its proud skill groups", () => {
    expect.hasAssertions();
    expect([
      takeOne(takeOne(ZIBAI_KIT.normalAttacks).hits).talentMultiplier,
      takeOne(ZIBAI_KIT.chargedAttack.hits).talentMultiplier,
      ZIBAI_KIT.plungeCollision.talentMultiplier,
      takeOne(ZIBAI_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(ZIBAI_KIT.highPlunge.hits).talentMultiplier,
    ]).toStrictEqual([0.505542, 0.73659, 0.639324, 1.278377, 1.596762]);
  });

  test("costs 60 energy for its burst, cooling for 15 seconds, and 20 stamina for its charged attack, its skill cooling for 18 seconds", () => {
    expect.hasAssertions();
    expect(ZIBAI_KIT.burstEnergyCost).toBe(60);
    expect(ZIBAI_KIT.burstCooldownSeconds).toBe(15);
    expect(ZIBAI_KIT.chargedAttackStamina).toBe(20);
    expect(ZIBAI_KIT.skillCooldownSeconds).toBe(18);
  });
});
