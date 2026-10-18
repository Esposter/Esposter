import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { KitActionRecord } from "#src/models/kit/record/KitActionRecord";
import type { KitHitRecord } from "#src/models/kit/record/KitHitRecord";
import type { KitRecord } from "#src/models/kit/record/KitRecord";

import { KitPlunge } from "#src/models/kit/record/KitPlunge";
import { KitTargeting } from "#src/models/kit/record/KitTargeting";
import { buildKit } from "#src/services/kit/buildKit";
import { createVesnaKitBehaviour } from "#src/services/kit/characters/vesnaKit";
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
  burst: createAction(100, [82]),
  burstCooldownSeconds: 15,
  chargedAttack: createAction(65, [36]),
  chargedAttackStamina: 0,
  frames: {},
  normalAttacks: [
    createAction(60, [10]),
    createAction(70, [13]),
    createAction(80, [9, 19]),
    createAction(90, [17]),
    createAction(100, [18]),
    createAction(110, [39]),
  ],
  plungeCollision: createHit(20),
  plunges: { [KitPlunge.High]: createAction(120, [38]), [KitPlunge.Low]: createAction(15, [36]) },
  skill: createAction(30, [21]),
  skillCooldownSeconds: 18,
  skillHolds: [],
};
const kit = buildKit(RECORD, TALENT_MULTIPLIER_MAP, createVesnaKitBehaviour);

describe(createVesnaKitBehaviour, () => {
  test("six strikes in sequence", () => {
    expect.hasAssertions();

    expect(
      kit.normalAttacks.map((action) => ({
        frames: toFrames(action.seconds),
        hitmarks: action.hits.map(({ hitmarkSeconds }) => toFrames(hitmarkSeconds)),
      })),
    ).toStrictEqual([
      { frames: 60, hitmarks: [10] },
      { frames: 70, hitmarks: [13] },
      { frames: 80, hitmarks: [9, 19] },
      { frames: 90, hitmarks: [17] },
      { frames: 100, hitmarks: [18] },
      { frames: 110, hitmarks: [39] },
    ]);
  });

  test("charged attack lands on the enemies in reach", () => {
    expect.hasAssertions();

    expect(toFrames(kit.chargedAttack.seconds)).toBe(65);
    expect(kit.chargedAttack.hits.map(({ hitmarkSeconds }) => toFrames(hitmarkSeconds))).toStrictEqual([36]);
  });

  test("plunge lands on the enemies in reach", () => {
    expect.hasAssertions();

    expect(toFrames(kit.lowPlunge.seconds)).toBe(15);
    expect(kit.lowPlunge.hits.map(({ hitmarkSeconds }) => toFrames(hitmarkSeconds))).toStrictEqual([36]);
    expect(toFrames(kit.highPlunge.seconds)).toBe(120);
    expect(kit.highPlunge.hits.map(({ hitmarkSeconds }) => toFrames(hitmarkSeconds))).toStrictEqual([38]);
    expect(toFrames(kit.plungeCollision.hitmarkSeconds)).toBe(20);
  });

  test("the Art of Victory deals one hit", () => {
    expect.hasAssertions();

    expect(toFrames(kit.elementalSkill.seconds)).toBe(30);
    expect(kit.elementalSkill.hits.map(({ hitmarkSeconds }) => toFrames(hitmarkSeconds))).toStrictEqual([21]);
  });

  test("for the Tsaritsa! deals one hit", () => {
    expect.hasAssertions();

    expect(toFrames(kit.elementalBurst.seconds)).toBe(100);
    expect(kit.elementalBurst.hits.map(({ hitmarkSeconds }) => toFrames(hitmarkSeconds))).toStrictEqual([82]);
    expect(kit.burstCooldownSeconds).toBe(15);
  });
});
