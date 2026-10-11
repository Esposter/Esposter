import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { createLaumaKit, LAUMA_CHARACTER_ID } from "#src/services/kit/characters/laumaKit";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { describe, expect, test } from "vitest";

const LAUMA_KIT = createLaumaKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [LAUMA_CHARACTER_ID]));

describe(createLaumaKit, () => {
  test("reads the strikes', charged attack's, plunges' and press's multipliers from her proud skill groups", () => {
    expect.hasAssertions();
    const multipliers = [
      ...LAUMA_KIT.normalAttacks.map(({ hits }) => hits[0]?.talentMultiplier),
      LAUMA_KIT.chargedAttack.hits[0]?.talentMultiplier,
      LAUMA_KIT.plungeCollision.talentMultiplier,
      LAUMA_KIT.lowPlunge.hits[0]?.talentMultiplier,
      LAUMA_KIT.highPlunge.hits[0]?.talentMultiplier,
      LAUMA_KIT.elementalSkill.hits[0]?.talentMultiplier,
    ];
    expect(multipliers).toStrictEqual([0.337024, 0.318048, 0.444968, 1.2904, 0.568288, 1.136335, 1.419344, 1.216]);
  });

  test("her burst costs 60 energy and cools for 15 seconds, her skill cools for 12 seconds, and her charged attack costs no stamina", () => {
    expect.hasAssertions();
    expect({
      burstCooldownSeconds: LAUMA_KIT.burstCooldownSeconds,
      burstEnergyCost: LAUMA_KIT.burstEnergyCost,
      chargedAttackStamina: LAUMA_KIT.chargedAttackStamina,
      skillCooldownSeconds: LAUMA_KIT.skillCooldownSeconds,
    }).toStrictEqual({
      burstCooldownSeconds: 15,
      burstEnergyCost: 60,
      chargedAttackStamina: 0,
      skillCooldownSeconds: 12,
    });
  });

  test("her three strikes hit at their hitmarks and cancel at their default frames", () => {
    expect.hasAssertions();
    expect(
      LAUMA_KIT.normalAttacks.map(({ hits, seconds }) => ({
        hitmarkFrames: Math.round((hits[0]?.hitmarkSeconds ?? 0) * 60),
        seconds: Math.round(seconds * 60),
      })),
    ).toStrictEqual([
      { hitmarkFrames: 14, seconds: 29 },
      { hitmarkFrames: 11, seconds: 33 },
      { hitmarkFrames: 16, seconds: 38 },
    ]);
  });

  test("the charged attack, Spiritcall Prayer, hits at 73 frames, after its 68-frame animation", () => {
    expect.hasAssertions();
    expect({
      hitmarkFrames: Math.round((LAUMA_KIT.chargedAttack.hits[0]?.hitmarkSeconds ?? 0) * 60),
      seconds: Math.round(LAUMA_KIT.chargedAttack.seconds * 60),
    }).toStrictEqual({ hitmarkFrames: 73, seconds: 68 });
  });

  test("the press of Hymn of Hunting hits at 16 frames, and the press is the only skill action built", () => {
    expect.hasAssertions();
    expect({
      holds: LAUMA_KIT.elementalSkillHolds,
      pressHitmarkFrames: Math.round((LAUMA_KIT.elementalSkill.hits[0]?.hitmarkSeconds ?? 0) * 60),
    }).toStrictEqual({ holds: undefined, pressHitmarkFrames: 16 });
  });
});
