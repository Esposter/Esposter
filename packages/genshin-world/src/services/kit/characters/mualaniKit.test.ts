import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import type { Combatant } from "#src/models/kit/Combatant";

import { Attribute } from "#src/models/character/Attribute";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { NIGHTSOUL_BLESSING_STATUS_ID, NIGHTSOUL_POINTS_ID } from "#src/services/kit/constants";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { countKitResource } from "#src/services/kit/effects/countKitResource";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { createMualaniKitBehaviour, MUALANI_CHARACTER_ID } from "#src/services/kit/characters/mualaniKit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const MUALANI_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, MUALANI_CHARACTER_ID);

const createMualaniCombatant = (constellationCount = 0): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: MUALANI_CHARACTER_ID,
  constellationCount,
  elementalResonances: [],
  kit: MUALANI_KIT,
  level: 90,
});
const toFrames = (seconds: number) => Math.round(seconds * 60);

describe(createMualaniKitBehaviour, () => {
  test("reads her three strikes, charged attack and plunges from her proud attack group", () => {
    expect.hasAssertions();
    const multipliers = [
      ...MUALANI_KIT.normalAttacks.flatMap(({ hits }) => hits.map(({ talentMultiplier }) => talentMultiplier)),
      takeOne(MUALANI_KIT.chargedAttack.hits).talentMultiplier,
      MUALANI_KIT.plungeCollision.talentMultiplier,
      takeOne(MUALANI_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(MUALANI_KIT.highPlunge.hits).talentMultiplier,
    ];
    expect(multipliers).toStrictEqual([
      expect.closeTo(0.514, 3),
      expect.closeTo(0.4463, 3),
      expect.closeTo(0.7003, 3),
      expect.closeTo(1.4288, 3),
      expect.closeTo(0.5683, 3),
      expect.closeTo(1.1363, 3),
      expect.closeTo(1.4193, 3),
    ]);
  });

  test("lands her strikes at gcsim's hitmarks, each of them one hit", () => {
    expect.hasAssertions();

    expect(
      MUALANI_KIT.normalAttacks.map((action) => ({
        frames: toFrames(action.seconds),
        hitmarks: action.hits.map(({ hitmarkSeconds }) => toFrames(hitmarkSeconds)),
      })),
    ).toStrictEqual([
      { frames: 33, hitmarks: [11] },
      { frames: 32, hitmarks: [9] },
      { frames: 67, hitmarks: [31] },
    ]);
  });

  test("the charged attack lands at 84 frames of 113 out of idle, and costs 50 stamina", () => {
    expect.hasAssertions();

    expect(toFrames(MUALANI_KIT.chargedAttack.seconds)).toBe(113);
    expect(toFrames(takeOne(MUALANI_KIT.chargedAttack.hits).hitmarkSeconds)).toBe(84);
    expect(MUALANI_KIT.chargedAttackStamina).toBe(50);
  });

  test("her burst lands at 178 frames of 180, on 60 energy and 15 seconds", () => {
    expect.hasAssertions();
    const [burstHit] = MUALANI_KIT.elementalBurst.hits;

    expect(toFrames(MUALANI_KIT.elementalBurst.seconds)).toBe(180);
    expect(toFrames(burstHit?.hitmarkSeconds ?? 0)).toBe(178);
    expect(MUALANI_KIT.burstEnergyCost).toBe(60);
    expect(MUALANI_KIT.burstCooldownSeconds).toBe(15);
    expect(burstHit?.talentMultiplier).toBe(0);
  });

  test("her skill has no hit while its Nightsoul Blessing is not built, and its cooldown is six seconds", () => {
    expect.hasAssertions();

    expect(MUALANI_KIT.elementalSkill.hits).toStrictEqual([]);
    expect(MUALANI_KIT.skillCooldownSeconds).toBe(6);
  });

  test("the skill's press enters the Nightsoul Blessing with 60 points, which drain ten a second, and a press in it leaves it", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createMualaniCombatant());
    MUALANI_KIT.elementalSkill.onStart?.(context);
    stepKitSeconds(context, 2);
    expect(countKitResource(context.kitEffectState.effects, MUALANI_CHARACTER_ID, NIGHTSOUL_POINTS_ID)).toBeCloseTo(40);
    MUALANI_KIT.elementalSkill.onStart?.(context);
    expect(
      findKitStatus(context.kitEffectState.effects, MUALANI_CHARACTER_ID, NIGHTSOUL_BLESSING_STATUS_ID),
    ).toBeUndefined();
  });
});
