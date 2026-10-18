import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { createYaoyaoKitBehaviour, YAOYAO_CHARACTER_ID } from "#src/services/kit/characters/yaoyaoKit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const YAOYAO_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, YAOYAO_CHARACTER_ID);

describe(createYaoyaoKitBehaviour, () => {
  test("reads each talent multiplier from her proud skill groups", () => {
    expect.hasAssertions();
    const multipliers = [
      ...YAOYAO_KIT.normalAttacks.flatMap((action) => action.hits.map((hit) => hit.talentMultiplier)),
      takeOne(YAOYAO_KIT.chargedAttack.hits).talentMultiplier,
      YAOYAO_KIT.plungeCollision.talentMultiplier,
      takeOne(YAOYAO_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(YAOYAO_KIT.highPlunge.hits).talentMultiplier,
      takeOne(YAOYAO_KIT.elementalBurst.hits).talentMultiplier,
    ];
    const expectedMultipliers = [
      0.510014, 0.474428, 0.313771, 0.329457, 0.779315, 1.1266, 0.639324, 1.278377, 1.596762, 1.1456,
    ];
    expect(multipliers).toStrictEqual(expectedMultipliers);
  });

  test("the cooldowns, costs and stamina her table gives", () => {
    expect.hasAssertions();
    expect([
      YAOYAO_KIT.skillCooldownSeconds,
      YAOYAO_KIT.burstCooldownSeconds,
      YAOYAO_KIT.burstEnergyCost,
      YAOYAO_KIT.chargedAttackStamina,
    ]).toStrictEqual([15, 20, 80, 25]);
  });

  test("the normal string's hitmarks, with the third strike's two hits", () => {
    expect.hasAssertions();
    const hitmarks = YAOYAO_KIT.normalAttacks.flatMap((action) =>
      action.hits.map((hit) => Math.round(hit.hitmarkSeconds * 60)),
    );
    expect(hitmarks).toStrictEqual([13, 16, 12, 31, 21]);
  });

  test("the burst's initial hit is a circle of 3 metres round the body, dealing no poise", () => {
    expect.hasAssertions();
    const hit = takeOne(YAOYAO_KIT.elementalBurst.hits);

    expect(hit.hitArea.radius).toBe(3);
    expect(hit.poiseDamage).toBe(0);
    expect(Math.round(hit.hitmarkSeconds * 60)).toBe(16);
  });
});
