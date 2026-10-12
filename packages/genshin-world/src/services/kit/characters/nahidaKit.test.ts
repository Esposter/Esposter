import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { createNahidaKitBehaviour, NAHIDA_CHARACTER_ID } from "#src/services/kit/characters/nahidaKit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { describe, expect, test } from "vitest";

const NAHIDA_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, NAHIDA_CHARACTER_ID);

describe(createNahidaKitBehaviour, () => {
  test("reads the strikes', charged attack's, plunges' and skill's multipliers from her proud skill groups", () => {
    expect.hasAssertions();
    const multipliers = [
      ...NAHIDA_KIT.normalAttacks.map(({ hits }) => hits[0]?.talentMultiplier),
      NAHIDA_KIT.chargedAttack.hits[0]?.talentMultiplier,
      NAHIDA_KIT.plungeCollision.talentMultiplier,
      NAHIDA_KIT.lowPlunge.hits[0]?.talentMultiplier,
      NAHIDA_KIT.highPlunge.hits[0]?.talentMultiplier,
      NAHIDA_KIT.elementalSkill.hits[0]?.talentMultiplier,
      NAHIDA_KIT.elementalSkillHolds?.[0]?.action.hits[0]?.talentMultiplier,
    ];
    expect(multipliers).toStrictEqual([
      0.403048, 0.369744, 0.458744, 0.584064, 1.32, 0.568288, 1.136335, 1.419344, 0.984, 1.304,
    ]);
  });

  test("the charged attack costs 50 stamina, her burst costs 50 energy and cools for 13.5 seconds, and her skill cools for 5 seconds", () => {
    expect.hasAssertions();
    expect({
      burstCooldownSeconds: NAHIDA_KIT.burstCooldownSeconds,
      burstEnergyCost: NAHIDA_KIT.burstEnergyCost,
      chargedAttackStamina: NAHIDA_KIT.chargedAttackStamina,
      skillCooldownSeconds: NAHIDA_KIT.skillCooldownSeconds,
    }).toStrictEqual({
      burstCooldownSeconds: 13.5,
      burstEnergyCost: 50,
      chargedAttackStamina: 50,
      skillCooldownSeconds: 5,
    });
  });

  test("her four strikes hit at their hitmarks and cancel at their default frames", () => {
    expect.hasAssertions();
    expect(
      NAHIDA_KIT.normalAttacks.map(({ hits, seconds }) => ({
        hitmarkFrames: Math.round((hits[0]?.hitmarkSeconds ?? 0) * 60),
        seconds: Math.round(seconds * 60),
      })),
    ).toStrictEqual([
      { hitmarkFrames: 23, seconds: 35 },
      { hitmarkFrames: 15, seconds: 31 },
      { hitmarkFrames: 26, seconds: 45 },
      { hitmarkFrames: 40, seconds: 71 },
    ]);
  });

  test("all Schemes to Know's press hits at 13 frames, and its full hold at 332 frames with a six-second cooldown", () => {
    expect.hasAssertions();
    const hold = NAHIDA_KIT.elementalSkillHolds?.[0];
    expect({
      holdCooldownSeconds: hold?.cooldownSeconds,
      holdHitmarkFrames: Math.round((hold?.action.hits[0]?.hitmarkSeconds ?? 0) * 60),
      minimumHeldSeconds: hold?.minimumHeldSeconds,
      pressHitmarkFrames: Math.round((NAHIDA_KIT.elementalSkill.hits[0]?.hitmarkSeconds ?? 0) * 60),
    }).toStrictEqual({ holdCooldownSeconds: 6, holdHitmarkFrames: 332, minimumHeldSeconds: 5, pressHitmarkFrames: 13 });
  });
});
