import type { KitHit } from "#src/models/kit/KitHit";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Element } from "#src/models/Element";
import { DILUC_CHARACTER_ID, NOELLE_CHARACTER_ID, XIAO_CHARACTER_ID } from "#src/services/character/constants";
import { createDilucKit } from "#src/services/kit/characters/dilucKit";
import { createNoelleKit } from "#src/services/kit/characters/noelleKit";
import { createXiaoKit } from "#src/services/kit/characters/xiaoKit";
import { infuseKitHits } from "#src/services/kit/effects/infuseKitHits";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const DILUC_KIT = createDilucKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [DILUC_CHARACTER_ID]));
const NOELLE_KIT = createNoelleKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [NOELLE_CHARACTER_ID]));
const XIAO_KIT = createXiaoKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [XIAO_CHARACTER_ID]));

describe(infuseKitHits, () => {
  test("infuses a normal attack and a collision at their gauges, and leaves a skill's hit as it was", () => {
    expect.hasAssertions();
    const normalHit = takeOne(takeOne(DILUC_KIT.normalAttacks).hits);
    const skillHit = takeOne(DILUC_KIT.elementalSkill.hits);
    const collisionHit = DILUC_KIT.plungeCollision;
    const landedHits: KitHit[] = [normalHit, skillHit, collisionHit];
    infuseKitHits(
      DILUC_KIT,
      { characterId: DILUC_CHARACTER_ID, element: Element.Pyro, kind: "infusion", secondsRemaining: 1 },
      landedHits,
      0,
    );
    expect(landedHits).toStrictEqual([
      { ...normalHit, element: Element.Pyro, gauge: 1 },
      skillHit,
      { ...collisionHit, element: Element.Pyro, gauge: 0 },
    ]);
  });

  test("an infusion that converts its attacks gives a normal attack its converted poise", () => {
    expect.hasAssertions();
    const normalHit = takeOne(takeOne(NOELLE_KIT.normalAttacks).hits);
    const landedHits: KitHit[] = [normalHit];
    infuseKitHits(
      NOELLE_KIT,
      {
        characterId: NOELLE_CHARACTER_ID,
        element: Element.Geo,
        isConverted: true,
        kind: "infusion",
        secondsRemaining: 1,
      },
      landedHits,
      0,
    );
    expect(landedHits[0]?.poiseDamage).toBeCloseTo(132.25, 2);
  });

  test("an infusion that converts its attacks gives a plunge its converted reach, and its DMG Bonus to each hit", () => {
    expect.hasAssertions();
    const plungeHit = takeOne(XIAO_KIT.highPlunge.hits);
    const landedHits: KitHit[] = [plungeHit];
    infuseKitHits(
      XIAO_KIT,
      {
        characterId: XIAO_CHARACTER_ID,
        damageBonus: 0.5845,
        element: Element.Anemo,
        isConverted: true,
        kind: "infusion",
        secondsRemaining: 1,
      },
      landedHits,
      0,
    );
    expect(landedHits).toStrictEqual([
      {
        ...plungeHit,
        damageBonus: 0.5845,
        element: Element.Anemo,
        gauge: 1,
        hitArea: plungeHit.convertedHitArea,
        poiseDamage: plungeHit.convertedPoiseDamage,
      },
    ]);
  });
});
