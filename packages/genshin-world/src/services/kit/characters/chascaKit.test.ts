import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { CHASCA_CHARACTER_ID, createChascaKitBehaviour } from "#src/services/kit/characters/chascaKit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { describe, expect, test } from "vitest";

const CHASCA_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, CHASCA_CHARACTER_ID);

const toFrames = (seconds: number) => Math.round(seconds * 60);

describe(createChascaKitBehaviour, () => {
  test("reads her normal attacks and fully-charged Aimed Shot from her proud attack group", () => {
    expect.hasAssertions();
    const multipliers = [
      ...CHASCA_KIT.normalAttacks.flatMap(({ hits }) => hits.map(({ talentMultiplier }) => talentMultiplier)),
      CHASCA_KIT.chargedAttack.hits[0]?.talentMultiplier ?? 0,
    ];
    expect(multipliers).toStrictEqual([
      expect.closeTo(0.4801, 3),
      expect.closeTo(0.4459, 3),
      expect.closeTo(0.297, 3),
      expect.closeTo(0.297, 3),
      expect.closeTo(0.2547, 3),
      expect.closeTo(1.24, 3),
    ]);
  });

  test("lands her normal attacks at gcsim's hitmarks, her third attack's two hits at 14 and 20 frames", () => {
    expect.hasAssertions();

    expect(
      CHASCA_KIT.normalAttacks.map((action) => ({
        frames: toFrames(action.seconds),
        hitmarks: action.hits.map(({ hitmarkSeconds }) => toFrames(hitmarkSeconds)),
      })),
    ).toStrictEqual([
      { frames: 27, hitmarks: [10] },
      { frames: 29, hitmarks: [8] },
      { frames: 53, hitmarks: [14, 20] },
      { frames: 73, hitmarks: [39] },
    ]);
  });

  test("the fully-charged Aimed Shot lands at 86 frames of 96 and spends no stamina", () => {
    expect.hasAssertions();

    expect(toFrames(CHASCA_KIT.chargedAttack.seconds)).toBe(96);
    expect(toFrames(CHASCA_KIT.chargedAttack.hits[0]?.hitmarkSeconds ?? 0)).toBe(86);
    expect(CHASCA_KIT.chargedAttackStamina).toBe(0);
  });

  test("plunges land at gcsim's hitmarks, the collision at 44 frames and the low plunge at 50 of 80", () => {
    expect.hasAssertions();

    expect(toFrames(CHASCA_KIT.plungeCollision.hitmarkSeconds)).toBe(44);
    expect(toFrames(CHASCA_KIT.lowPlunge.seconds)).toBe(80);
    expect(CHASCA_KIT.lowPlunge.hits.map(({ hitmarkSeconds }) => toFrames(hitmarkSeconds))).toStrictEqual([50]);
  });

  test("spirit reins' resonance lands at 3 frames, on a 6.5 second cooldown", () => {
    expect.hasAssertions();

    expect(CHASCA_KIT.elementalSkill.hits.map(({ hitmarkSeconds }) => toFrames(hitmarkSeconds))).toStrictEqual([3]);
    expect(CHASCA_KIT.skillCooldownSeconds).toBe(6.5);
  });

  test("galesplitting lands at 96 frames of its 114-frame animation, costing 60 energy on a 15 second cooldown", () => {
    expect.hasAssertions();

    expect(toFrames(CHASCA_KIT.elementalBurst.seconds)).toBe(114);
    expect(CHASCA_KIT.elementalBurst.hits.map(({ hitmarkSeconds }) => toFrames(hitmarkSeconds))).toStrictEqual([96]);
    expect(CHASCA_KIT.burstEnergyCost).toBe(60);
    expect(CHASCA_KIT.burstCooldownSeconds).toBe(15);
  });
});
