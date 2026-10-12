import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { createMizukiKitBehaviour, MIZUKI_CHARACTER_ID } from "#src/services/kit/characters/mizukiKit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { describe, expect, test } from "vitest";

const MIZUKI_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, MIZUKI_CHARACTER_ID);

describe(createMizukiKitBehaviour, () => {
  test("reads each talent multiplier, cooldown and cost from her proud skill groups, to four decimal places", () => {
    expect.hasAssertions();
    const multipliers = [
      ...MIZUKI_KIT.normalAttacks.map(({ hits }) => hits[0]?.talentMultiplier),
      MIZUKI_KIT.chargedAttack.hits[0]?.talentMultiplier,
      MIZUKI_KIT.plungeCollision.talentMultiplier,
      MIZUKI_KIT.lowPlunge.hits[0]?.talentMultiplier,
      MIZUKI_KIT.highPlunge.hits[0]?.talentMultiplier,
      MIZUKI_KIT.elementalSkill.hits[0]?.talentMultiplier,
      MIZUKI_KIT.elementalBurst.hits[0]?.talentMultiplier,
    ].map((multiplier) => Number(multiplier?.toFixed(4)));

    expect(multipliers).toStrictEqual([0.5228, 0.4691, 0.7137, 1.3, 0.5683, 1.1363, 1.4193, 0.5774, 0.9408]);
    expect([
      MIZUKI_KIT.chargedAttackStamina,
      MIZUKI_KIT.skillCooldownSeconds,
      MIZUKI_KIT.burstCooldownSeconds,
      MIZUKI_KIT.burstEnergyCost,
    ]).toStrictEqual([50, 15, 15, 60]);
  });

  test("lands her strikes ten frames after their hitmarks, her charged attack at 39 frames, her skill's activation at 2, and her burst at 93", () => {
    expect.hasAssertions();
    expect({
      burstHitmarkFrames: MIZUKI_KIT.elementalBurst.hits.map(({ hitmarkSeconds }) => Math.round(hitmarkSeconds * 60)),
      chargedAttackHitmarkFrames: MIZUKI_KIT.chargedAttack.hits.map(({ hitmarkSeconds }) =>
        Math.round(hitmarkSeconds * 60),
      ),
      normalAttackHitmarkFrames: MIZUKI_KIT.normalAttacks.map(({ hits }) =>
        Math.round((hits[0]?.hitmarkSeconds ?? 0) * 60),
      ),
      skillHitmarkFrames: MIZUKI_KIT.elementalSkill.hits.map(({ hitmarkSeconds }) => Math.round(hitmarkSeconds * 60)),
    }).toStrictEqual({
      burstHitmarkFrames: [93],
      chargedAttackHitmarkFrames: [39],
      normalAttackHitmarkFrames: [17, 29, 47],
      skillHitmarkFrames: [2],
    });
  });
});
