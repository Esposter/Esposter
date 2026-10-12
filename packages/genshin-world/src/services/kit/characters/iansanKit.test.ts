import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { createIansanKitBehaviour, IANSAN_CHARACTER_ID } from "#src/services/kit/characters/iansanKit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { describe, expect, test } from "vitest";

const IANSAN_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, IANSAN_CHARACTER_ID);

describe(createIansanKitBehaviour, () => {
  test("reads each talent multiplier, cooldown and cost from her proud skill groups, to four decimal places", () => {
    expect.hasAssertions();
    const multipliers = [
      ...IANSAN_KIT.normalAttacks.map(({ hits }) => hits[0]?.talentMultiplier),
      IANSAN_KIT.chargedAttack.hits[0]?.talentMultiplier,
      IANSAN_KIT.plungeCollision.talentMultiplier,
      IANSAN_KIT.lowPlunge.hits[0]?.talentMultiplier,
      IANSAN_KIT.highPlunge.hits[0]?.talentMultiplier,
      IANSAN_KIT.elementalSkill.hits[0]?.talentMultiplier,
      IANSAN_KIT.elementalBurst.hits[0]?.talentMultiplier,
    ].map((multiplier) => Number(multiplier?.toFixed(4)));

    expect(multipliers).toStrictEqual([0.4698, 0.4276, 0.6439, 1.0028, 0.6393, 1.2784, 1.5968, 2.864, 4.304]);
    expect([
      IANSAN_KIT.chargedAttackStamina,
      IANSAN_KIT.skillCooldownSeconds,
      IANSAN_KIT.burstCooldownSeconds,
      IANSAN_KIT.burstEnergyCost,
    ]).toStrictEqual([25, 16, 18, 70]);
  });

  test("lands her strikes at their hitmarks, her charged attack at 21 frames, her skill's activation at 9, and her burst at 38", () => {
    expect.hasAssertions();
    expect({
      burstHitmarkFrames: IANSAN_KIT.elementalBurst.hits.map(({ hitmarkSeconds }) => Math.round(hitmarkSeconds * 60)),
      chargedAttackHitmarkFrames: IANSAN_KIT.chargedAttack.hits.map(({ hitmarkSeconds }) =>
        Math.round(hitmarkSeconds * 60),
      ),
      normalAttackHitmarkFrames: IANSAN_KIT.normalAttacks.map(({ hits }) =>
        Math.round((hits[0]?.hitmarkSeconds ?? 0) * 60),
      ),
      skillHitmarkFrames: IANSAN_KIT.elementalSkill.hits.map(({ hitmarkSeconds }) => Math.round(hitmarkSeconds * 60)),
    }).toStrictEqual({
      burstHitmarkFrames: [38],
      chargedAttackHitmarkFrames: [21],
      normalAttackHitmarkFrames: [14, 7, 22],
      skillHitmarkFrames: [9],
    });
  });
});
