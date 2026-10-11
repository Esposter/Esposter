import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Element } from "#src/models/Element";
import { DILUC_CHARACTER_ID } from "#src/services/kit/characters/dilucKit";
import { NOELLE_CHARACTER_ID } from "#src/services/kit/characters/noelleKit";
import { XIAO_CHARACTER_ID } from "#src/services/kit/characters/xiaoKit";
import { infuseKitHit } from "#src/services/kit/effects/infuseKitHit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

// Each kit's hits tagged with their actions' kinds, which an infusion reads, as a kit is built
const DILUC_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, DILUC_CHARACTER_ID);
const NOELLE_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, NOELLE_CHARACTER_ID);
const XIAO_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, XIAO_CHARACTER_ID);

describe(infuseKitHit, () => {
  test("infuses a normal attack and a collision at their gauges, and leaves a skill's hit as it was", () => {
    expect.hasAssertions();
    const normalHit = takeOne(takeOne(DILUC_KIT.normalAttacks).hits);
    const skillHit = takeOne(DILUC_KIT.elementalSkill.hits);
    const collisionHit = DILUC_KIT.plungeCollision;
    const infusion = {
      characterId: DILUC_CHARACTER_ID,
      element: Element.Pyro,
      kind: "infusion",
      secondsRemaining: 1,
    } as const;

    expect([normalHit, skillHit, collisionHit].map((hit) => infuseKitHit(hit, infusion))).toStrictEqual([
      { ...normalHit, element: Element.Pyro, gauge: 1 },
      skillHit,
      { ...collisionHit, element: Element.Pyro, gauge: 0 },
    ]);
  });

  test("an infusion that converts its attacks gives a normal attack its converted poise", () => {
    expect.hasAssertions();
    const normalHit = takeOne(takeOne(NOELLE_KIT.normalAttacks).hits);

    expect(
      infuseKitHit(normalHit, {
        characterId: NOELLE_CHARACTER_ID,
        element: Element.Geo,
        isConverted: true,
        kind: "infusion",
        secondsRemaining: 1,
      }).poiseDamage,
    ).toBeCloseTo(132.25, 2);
  });

  test("an infusion that converts its attacks gives a plunge its converted reach, and its DMG Bonus to each hit", () => {
    expect.hasAssertions();
    const plungeHit = takeOne(XIAO_KIT.highPlunge.hits);

    expect(
      infuseKitHit(plungeHit, {
        characterId: XIAO_CHARACTER_ID,
        damageBonus: 0.5845,
        element: Element.Anemo,
        isConverted: true,
        kind: "infusion",
        secondsRemaining: 1,
      }),
    ).toStrictEqual({
      ...plungeHit,
      damageBonus: 0.5845,
      element: Element.Anemo,
      gauge: 1,
      hitArea: plungeHit.convertedHitArea,
      poiseDamage: plungeHit.convertedPoiseDamage,
    });
  });
});
