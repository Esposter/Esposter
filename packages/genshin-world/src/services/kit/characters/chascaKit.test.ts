import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { CHASCA_CHARACTER_ID, createChascaKitBehaviour } from "#src/services/kit/characters/chascaKit";
import { NIGHTSOUL_BLESSING_STATUS_ID, NIGHTSOUL_POINTS_ID } from "#src/services/kit/constants";
import { createKitState } from "#src/services/kit/createKitState";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { countKitResource } from "#src/services/kit/effects/countKitResource";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { hasKitNightsoulBlessing } from "#src/services/kit/effects/hasKitNightsoulBlessing";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { describe, expect, test } from "vitest";

const CHASCA_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, CHASCA_CHARACTER_ID);
const toFrames = (seconds: number) => Math.round(seconds * 60);

const createChascaCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: CHASCA_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: CHASCA_KIT,
  level: 90,
});

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

  test("the skill's press enters the Nightsoul Blessing with 80 points, which drain eight a second", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createChascaCombatant());
    CHASCA_KIT.elementalSkill.onStart?.(context);
    stepKitSeconds(context, 2);
    expect(countKitResource(context.kitEffectState.effects, CHASCA_CHARACTER_ID, NIGHTSOUL_POINTS_ID)).toBeCloseTo(64);
  });

  test("the blessing ends when its points drain to none, ten seconds after the press", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createChascaCombatant());
    CHASCA_KIT.elementalSkill.onStart?.(context);
    stepKitSeconds(context, 9.5);
    expect(hasKitNightsoulBlessing(context.kitEffectState.effects, CHASCA_CHARACTER_ID)).toBe(true);
    stepKitSeconds(context, 1);
    expect(hasKitNightsoulBlessing(context.kitEffectState.effects, CHASCA_CHARACTER_ID)).toBe(false);
  });

  test("a press inside the Nightsoul Blessing leaves it", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createChascaCombatant());
    CHASCA_KIT.elementalSkill.onStart?.(context);
    CHASCA_KIT.elementalSkill.onStart?.(context);
    expect(
      findKitStatus(context.kitEffectState.effects, CHASCA_CHARACTER_ID, NIGHTSOUL_BLESSING_STATUS_ID),
    ).toBeUndefined();
  });

  test("a sprint in the Nightsoul Blessing drains 13.3 points", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createChascaCombatant());
    CHASCA_KIT.elementalSkill.onStart?.(context);
    stepKitSeconds(context, 1);
    CHASCA_KIT.onSprint?.(context, createKitState());
    expect(countKitResource(context.kitEffectState.effects, CHASCA_CHARACTER_ID, NIGHTSOUL_POINTS_ID)).toBeCloseTo(
      58.7,
    );
  });

  test("a sprint outside the Nightsoul Blessing drains nothing", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createChascaCombatant());
    CHASCA_KIT.onSprint?.(context, createKitState());
    expect(countKitResource(context.kitEffectState.effects, CHASCA_CHARACTER_ID, NIGHTSOUL_POINTS_ID)).toBe(0);
  });
});
