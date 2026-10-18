import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { KitActionRecord } from "#src/models/kit/record/KitActionRecord";
import type { KitHitRecord } from "#src/models/kit/record/KitHitRecord";
import type { KitRecord } from "#src/models/kit/record/KitRecord";

import { KitPlunge } from "#src/models/kit/record/KitPlunge";
import { KitTargeting } from "#src/models/kit/record/KitTargeting";
import { buildKit } from "#src/services/kit/buildKit";
import { createAlyoshaKitBehaviour } from "#src/services/kit/characters/alyoshaKit";
import { describe, expect, test } from "vitest";

const PROUD_SKILL_GROUP_ID = 1;
const TALENT_MULTIPLIER_MAP: TalentMultiplierMap = { [PROUD_SKILL_GROUP_ID]: [{ level: 1, paramList: [0.5] }] };
const TALENT_LEVEL_MAP = { [PROUD_SKILL_GROUP_ID]: 1 };
const toFrames = (seconds: number) => Math.round(seconds * 60);
const createHit = (hitmarkFrames: number): KitHitRecord => ({
  area: { angle: 2 * Math.PI, height: 2, radius: 1 },
  hitmarkFrames,
  multiplier: { index: 0, proudSkillGroupId: PROUD_SKILL_GROUP_ID },
  poiseDamage: 0,
});
const createAction = (animationFrames: number, hitmarkFrames: number[]): KitActionRecord => ({
  animationFrames,
  hits: hitmarkFrames.map((hitmarkFrame) => createHit(hitmarkFrame)),
  targeting: KitTargeting.Strike,
});
const RECORD: KitRecord = {
  areas: {},
  burst: createAction(50, []),
  burstCooldownSeconds: 18,
  chargedAttack: createAction(42, [25]),
  chargedAttackStamina: 0,
  frames: {},
  normalAttacks: [createAction(60, [11]), createAction(70, [16]), createAction(80, [16, 39]), createAction(90, [43])],
  plungeCollision: createHit(30),
  plunges: { [KitPlunge.High]: createAction(107, [38]), [KitPlunge.Low]: createAction(18, [36]) },
  skill: createAction(20, [16]),
  skillCooldownSeconds: 15,
  skillHolds: [],
};
const kit = buildKit(RECORD, TALENT_MULTIPLIER_MAP, TALENT_LEVEL_MAP, createAlyoshaKitBehaviour);

describe(createAlyoshaKitBehaviour, () => {
  test("four strikes in sequence", () => {
    expect.hasAssertions();

    expect(
      kit.normalAttacks.map((action) => ({
        frames: toFrames(action.seconds),
        hitmarks: action.hits.map(({ hitmarkSeconds }) => toFrames(hitmarkSeconds)),
      })),
    ).toStrictEqual([
      { frames: 60, hitmarks: [11] },
      { frames: 70, hitmarks: [16] },
      { frames: 80, hitmarks: [16, 39] },
      { frames: 90, hitmarks: [43] },
    ]);
  });

  test("charged attack lands on the enemies in reach", () => {
    expect.hasAssertions();

    expect(toFrames(kit.chargedAttack.seconds)).toBe(42);
    expect(kit.chargedAttack.hits.map(({ hitmarkSeconds }) => toFrames(hitmarkSeconds))).toStrictEqual([25]);
  });

  test("plunge lands on the enemies in reach", () => {
    expect.hasAssertions();

    expect(toFrames(kit.lowPlunge.seconds)).toBe(18);
    expect(kit.lowPlunge.hits.map(({ hitmarkSeconds }) => toFrames(hitmarkSeconds))).toStrictEqual([36]);
    expect(toFrames(kit.highPlunge.seconds)).toBe(107);
    expect(kit.highPlunge.hits.map(({ hitmarkSeconds }) => toFrames(hitmarkSeconds))).toStrictEqual([38]);
    expect(toFrames(kit.plungeCollision.hitmarkSeconds)).toBe(30);
  });

  test("thunderbolt strike's tap deals one hit", () => {
    expect.hasAssertions();

    expect(toFrames(kit.elementalSkill.seconds)).toBe(20);
    expect(kit.elementalSkill.hits.map(({ hitmarkSeconds }) => toFrames(hitmarkSeconds))).toStrictEqual([16]);
  });

  test("hunter's advance deals no hit yet", () => {
    expect.hasAssertions();

    expect(toFrames(kit.elementalBurst.seconds)).toBe(50);
    expect(kit.elementalBurst.hits).toHaveLength(0);
    expect(kit.burstCooldownSeconds).toBe(18);
  });
});
