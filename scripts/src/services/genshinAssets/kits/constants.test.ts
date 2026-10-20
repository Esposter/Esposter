import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { KitActionRecord, KitHitRecord, KitRecord } from "genshin-world";

import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { flattenKitValues } from "#src/services/genshinAssets/kits/record/flattenKitValues";
import { CombatTalent, KitPlunge, KitTargeting } from "genshin-world";
import { describe } from "vitest";

// The kit record the build suites share: one hit in every action, and a record whose every value the build reads back,
// So the one path a case gets wrong is the one mismatch reported
export const HIT_RECORD: KitHitRecord = {
  area: { angle: 2 * Math.PI, height: 2, radius: 1 },
  hitmarkFrames: 12,
  multiplier: { index: 0, proudSkillGroupId: 1 },
  poiseDamage: 0,
};
const ACTION_RECORD: KitActionRecord = { animationFrames: 30, hits: [HIT_RECORD], targeting: KitTargeting.Strike };
export const RECORD: KitRecord = {
  burst: ACTION_RECORD,
  burstCooldownSeconds: 15,
  chargedAttack: ACTION_RECORD,
  chargedAttackStamina: 20,
  normalAttacks: [ACTION_RECORD],
  plungeCollision: HIT_RECORD,
  plunges: { [KitPlunge.High]: ACTION_RECORD, [KitPlunge.Low]: ACTION_RECORD },
  skill: ACTION_RECORD,
  skillCooldownSeconds: 6,
  skillHolds: [],
};
// Every value of the record as gcsim gives it, each at a line of its own
export const SOURCE_CANDIDATE_MAP: Map<string, KitCandidate[]> = new Map<string, KitCandidate[]>(
  Array.from(flattenKitValues(RECORD), ([path, value], index) => [
    path,
    [{ provenance: { file: "kit.go", line: index + 1, source: KitSource.Gcsim }, value }],
  ]),
);

// Fixtures only: a suite here would run again in every file that imports them
describe.todo("constants");

// The talents' proud skill groups, by which a named hit's targeting area is read: the normal attack's group takes the
// Strikes'
export const TALENT_GROUP_ID_MAP: Record<CombatTalent, number> = {
  [CombatTalent.ElementalBurst]: 3,
  [CombatTalent.ElementalSkill]: 2,
  [CombatTalent.NormalAttack]: 1,
};
