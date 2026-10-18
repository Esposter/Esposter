import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { KitActionRecord } from "#src/models/kit/record/KitActionRecord";
import type { KitHitRecord } from "#src/models/kit/record/KitHitRecord";
import type { KitRecord } from "#src/models/kit/record/KitRecord";

import { KitPlunge } from "#src/models/kit/record/KitPlunge";
import { KitTargeting } from "#src/models/kit/record/KitTargeting";
import { buildKit } from "#src/services/kit/buildKit";
import { createSandroneKitBehaviour } from "#src/services/kit/characters/sandroneKit";
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
  burst: createAction(92, [50, 59, 67, 100]),
  burstCooldownSeconds: 15,
  chargedAttack: createAction(128, [24]),
  chargedAttackStamina: 0,
  frames: {},
  normalAttacks: [createAction(145, [21]), createAction(228, [22]), createAction(296, [44])],
  plungeCollision: createHit(30),
  plunges: { [KitPlunge.High]: createAction(185, [38]), [KitPlunge.Low]: createAction(25, [36]) },
  skill: createAction(66, [15, 33]),
  skillCooldownSeconds: 4,
  skillHolds: [],
};
const kit = buildKit(RECORD, TALENT_MULTIPLIER_MAP, createSandroneKitBehaviour);

describe(createSandroneKitBehaviour, () => {
  test("three strikes in sequence", () => {
    expect.hasAssertions();

    expect(
      kit.normalAttacks.map((action) => ({
        frames: toFrames(action.seconds),
        hitmarks: action.hits.map(({ hitmarkSeconds }) => toFrames(hitmarkSeconds)),
      })),
    ).toStrictEqual([
      { frames: 145, hitmarks: [21] },
      { frames: 228, hitmarks: [22] },
      { frames: 296, hitmarks: [44] },
    ]);
  });

  test("charged attack lands on the enemies in reach", () => {
    expect.hasAssertions();

    expect(toFrames(kit.chargedAttack.seconds)).toBe(128);
    expect(kit.chargedAttack.hits.map(({ hitmarkSeconds }) => toFrames(hitmarkSeconds))).toStrictEqual([24]);
  });

  test("plunge lands on the enemies in reach", () => {
    expect.hasAssertions();

    expect(toFrames(kit.lowPlunge.seconds)).toBe(25);
    expect(kit.lowPlunge.hits.map(({ hitmarkSeconds }) => toFrames(hitmarkSeconds))).toStrictEqual([36]);
    expect(toFrames(kit.highPlunge.seconds)).toBe(185);
    expect(kit.highPlunge.hits.map(({ hitmarkSeconds }) => toFrames(hitmarkSeconds))).toStrictEqual([38]);
    expect(toFrames(kit.plungeCollision.hitmarkSeconds)).toBe(30);
  });

  test("prism shot deals two hits", () => {
    expect.hasAssertions();

    expect(toFrames(kit.elementalSkill.seconds)).toBe(66);
    expect(kit.elementalSkill.hits.map(({ hitmarkSeconds }) => toFrames(hitmarkSeconds))).toStrictEqual([15, 33]);
    expect(kit.skillCooldownSeconds).toBe(4);
  });

  test("bombardment and the convective inhibition ray deal four hits", () => {
    expect.hasAssertions();

    expect(toFrames(kit.elementalBurst.seconds)).toBe(92);
    expect(kit.elementalBurst.hits.map(({ hitmarkSeconds }) => toFrames(hitmarkSeconds))).toStrictEqual([
      50, 59, 67, 100,
    ]);
    expect(kit.burstCooldownSeconds).toBe(15);
  });
});
