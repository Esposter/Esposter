import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { createXilonenKitBehaviour, XILONEN_CHARACTER_ID } from "#src/services/kit/characters/xilonenKit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const XILONEN_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, XILONEN_CHARACTER_ID);

const toFrames = (seconds: number) => Math.round(seconds * 60);

describe(createXilonenKitBehaviour, () => {
  test("reads her strikes and charged attack from her proud attack group", () => {
    expect.hasAssertions();
    const multipliers = [
      ...XILONEN_KIT.normalAttacks.flatMap(({ hits }) => hits.map(({ talentMultiplier }) => talentMultiplier)),
      takeOne(XILONEN_KIT.chargedAttack.hits).talentMultiplier,
    ];
    expect(multipliers).toStrictEqual([
      expect.closeTo(0.5179, 3),
      expect.closeTo(0.2737, 3),
      expect.closeTo(0.2737, 3),
      expect.closeTo(0.7295, 3),
      expect.closeTo(0.9133, 3),
    ]);
  });

  test("lands her strikes at gcsim's hitmarks, the second strike's two hits at 16 and 32 frames", () => {
    expect.hasAssertions();

    expect(
      XILONEN_KIT.normalAttacks.map((action) => ({
        frames: toFrames(action.seconds),
        hitmarks: action.hits.map(({ hitmarkSeconds }) => toFrames(hitmarkSeconds)),
      })),
    ).toStrictEqual([
      { frames: 34, hitmarks: [18] },
      { frames: 57, hitmarks: [16, 32] },
      { frames: 70, hitmarks: [22] },
    ]);
  });

  test("the charged attack lands at 23 frames of 42, costs 20 stamina and has Poise 120", () => {
    expect.hasAssertions();
    const [chargedHit] = XILONEN_KIT.chargedAttack.hits;

    expect(toFrames(XILONEN_KIT.chargedAttack.seconds)).toBe(42);
    expect(toFrames(chargedHit?.hitmarkSeconds ?? 0)).toBe(23);
    expect(chargedHit?.poiseDamage).toBe(120);
    expect(XILONEN_KIT.chargedAttackStamina).toBe(20);
  });

  test("yohual's scratch lands at 6 frames of its 20-frame animation, on a 7 second cooldown", () => {
    expect.hasAssertions();

    expect(toFrames(XILONEN_KIT.elementalSkill.seconds)).toBe(20);
    expect(XILONEN_KIT.elementalSkill.hits.map(({ hitmarkSeconds }) => toFrames(hitmarkSeconds))).toStrictEqual([6]);
    expect(XILONEN_KIT.skillCooldownSeconds).toBe(7);
  });

  test("her burst is not built, so it keeps its 101-frame animation and its cost and cooldown", () => {
    expect.hasAssertions();

    expect(XILONEN_KIT.elementalBurst.hits).toStrictEqual([]);
    expect(toFrames(XILONEN_KIT.elementalBurst.seconds)).toBe(101);
    expect(XILONEN_KIT.burstEnergyCost).toBe(60);
    expect(XILONEN_KIT.burstCooldownSeconds).toBe(15);
  });
});
