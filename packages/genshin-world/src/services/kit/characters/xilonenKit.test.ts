import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { createXilonenKitBehaviour, XILONEN_CHARACTER_ID } from "#src/services/kit/characters/xilonenKit";
import { NIGHTSOUL_POINTS_ID } from "#src/services/kit/constants";
import { createKitState } from "#src/services/kit/createKitState";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { countKitResource } from "#src/services/kit/effects/countKitResource";
import { hasKitNightsoulBlessing } from "#src/services/kit/effects/hasKitNightsoulBlessing";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const XILONEN_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, XILONEN_CHARACTER_ID);
const toFrames = (seconds: number) => Math.round(seconds * 60);

const createXilonenCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: XILONEN_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: XILONEN_KIT,
  level: 90,
});

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

  test("the skill's press enters the Nightsoul Blessing with 45 points, which drain five a second", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createXilonenCombatant());
    XILONEN_KIT.elementalSkill.onStart?.(context);
    stepKitSeconds(context, 2);
    expect(countKitResource(context.kitEffectState.effects, XILONEN_CHARACTER_ID, NIGHTSOUL_POINTS_ID)).toBeCloseTo(35);
  });

  test("the Blessing lasts nine seconds, and ends with its points", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createXilonenCombatant());
    XILONEN_KIT.elementalSkill.onStart?.(context);
    stepKitSeconds(context, 8.5);
    expect(hasKitNightsoulBlessing(context.kitEffectState.effects, XILONEN_CHARACTER_ID)).toBe(true);
    stepKitSeconds(context, 0.6);
    expect(hasKitNightsoulBlessing(context.kitEffectState.effects, XILONEN_CHARACTER_ID)).toBe(false);
  });

  test("a press inside the Nightsoul Blessing leaves it", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createXilonenCombatant());
    XILONEN_KIT.elementalSkill.onStart?.(context);
    XILONEN_KIT.elementalSkill.onStart?.(context);
    expect(hasKitNightsoulBlessing(context.kitEffectState.effects, XILONEN_CHARACTER_ID)).toBe(false);
  });

  test("a sprint in the Nightsoul Blessing drains five points", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createXilonenCombatant());
    XILONEN_KIT.elementalSkill.onStart?.(context);
    XILONEN_KIT.onSprint?.(context, createKitState());
    expect(countKitResource(context.kitEffectState.effects, XILONEN_CHARACTER_ID, NIGHTSOUL_POINTS_ID)).toBeCloseTo(40);
  });

  test("a sprint outside the Nightsoul Blessing drains nothing", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createXilonenCombatant());
    XILONEN_KIT.onSprint?.(context, createKitState());
    expect(countKitResource(context.kitEffectState.effects, XILONEN_CHARACTER_ID, NIGHTSOUL_POINTS_ID)).toBe(0);
  });
});
