import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { KitActionRecord } from "#src/models/kit/record/KitActionRecord";
import type { KitHitRecord } from "#src/models/kit/record/KitHitRecord";
import type { KitRecord } from "#src/models/kit/record/KitRecord";

import { KitPlunge } from "#src/models/kit/record/KitPlunge";
import { KitTargeting } from "#src/models/kit/record/KitTargeting";
import { buildKit } from "#src/services/kit/buildKit";
import { createVodyanitsaKitBehaviour } from "#src/services/kit/characters/vodyanitsaKit";
import { describe, expect, test } from "vitest";

const PROUD_SKILL_GROUP_ID = 1;
const TALENT_MULTIPLIER_MAP: TalentMultiplierMap = { [PROUD_SKILL_GROUP_ID]: [{ level: 1, paramList: [0.5] }] };
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
  burst: createAction(98, [107]),
  burstCooldownSeconds: 15,
  chargedAttack: createAction(35, [41]),
  chargedAttackStamina: 0,
  frames: {},
  normalAttacks: [createAction(198, [6]), createAction(162, [11]), createAction(232, [12]), createAction(256, [32])],
  plungeCollision: createHit(44),
  plunges: { [KitPlunge.High]: createAction(154, [38]), [KitPlunge.Low]: createAction(6, [36]) },
  skill: createAction(40, [21]),
  skillCooldownSeconds: 16,
  skillHolds: [],
};
const kit = buildKit(RECORD, TALENT_MULTIPLIER_MAP, createVodyanitsaKitBehaviour);

describe(createVodyanitsaKitBehaviour, () => {
  test("four strikes in sequence", () => {
    expect.hasAssertions();

    expect(
      kit.normalAttacks.map((action) => ({
        frames: toFrames(action.seconds),
        hitmarks: action.hits.map(({ hitmarkSeconds }) => toFrames(hitmarkSeconds)),
      })),
    ).toStrictEqual([
      { frames: 198, hitmarks: [6] },
      { frames: 162, hitmarks: [11] },
      { frames: 232, hitmarks: [12] },
      { frames: 256, hitmarks: [32] },
    ]);
  });

  test("charged attack lands on the enemies in reach", () => {
    expect.hasAssertions();

    expect(toFrames(kit.chargedAttack.seconds)).toBe(35);
    expect(kit.chargedAttack.hits.map(({ hitmarkSeconds }) => toFrames(hitmarkSeconds))).toStrictEqual([41]);
  });

  test("plunge lands on the enemies in reach", () => {
    expect.hasAssertions();

    expect(toFrames(kit.lowPlunge.seconds)).toBe(6);
    expect(kit.lowPlunge.hits.map(({ hitmarkSeconds }) => toFrames(hitmarkSeconds))).toStrictEqual([36]);
    expect(toFrames(kit.highPlunge.seconds)).toBe(154);
    expect(kit.highPlunge.hits.map(({ hitmarkSeconds }) => toFrames(hitmarkSeconds))).toStrictEqual([38]);
    expect(toFrames(kit.plungeCollision.hitmarkSeconds)).toBe(44);
  });

  test("rechitativ: sonorous dawn deals one hit", () => {
    expect.hasAssertions();

    expect(toFrames(kit.elementalSkill.seconds)).toBe(40);
    expect(kit.elementalSkill.hits.map(({ hitmarkSeconds }) => toFrames(hitmarkSeconds))).toStrictEqual([21]);
    expect(kit.skillCooldownSeconds).toBe(16);
  });

  test("koda: sink with thee deals one hit", () => {
    expect.hasAssertions();

    expect(toFrames(kit.elementalBurst.seconds)).toBe(98);
    expect(kit.elementalBurst.hits.map(({ hitmarkSeconds }) => toFrames(hitmarkSeconds))).toStrictEqual([107]);
    expect(kit.burstCooldownSeconds).toBe(15);
  });
});
