import type { TalentLevelMap } from "#src/models/character/TalentLevelMap";
import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { KitHitRecord } from "#src/models/kit/record/KitHitRecord";
import type { KitParameter } from "#src/models/kit/record/KitParameter";

import { createKitRecordResolver } from "#src/services/kit/build/createKitRecordResolver";
import { describe, expect, test } from "vitest";

// A normal attack's table at level 1, and a skill's at level 10, which a factor reads at the skill's level
const TALENT_MULTIPLIER_MAP: TalentMultiplierMap = {
  "1": [{ level: 1, paramList: [0.5] }],
  "2": [{ level: 10, paramList: [3] }],
};
const TALENT_LEVEL_MAP: TalentLevelMap = { "1": 1, "2": 10 };

const createHitRecord = (multiplierFactor?: KitParameter): KitHitRecord => ({
  area: { angle: 360, height: 1, radius: 1 },
  hitmarkFrames: 10,
  multiplier: { index: 0, proudSkillGroupId: 1 },
  multiplierFactor,
  poiseDamage: 0,
});

describe(createKitRecordResolver, () => {
  test("a hit's multiplier is multiplied by its factor, each read at the level of its own talent", () => {
    expect.hasAssertions();
    const { toHitFields } = createKitRecordResolver(TALENT_MULTIPLIER_MAP, TALENT_LEVEL_MAP);
    expect(toHitFields(createHitRecord({ index: 0, proudSkillGroupId: 2 })).talentMultiplier).toBe(1.5);
  });

  test("a hit with no factor resolves to its multiplier alone", () => {
    expect.hasAssertions();
    const { toHitFields } = createKitRecordResolver(TALENT_MULTIPLIER_MAP, TALENT_LEVEL_MAP);
    expect(toHitFields(createHitRecord()).talentMultiplier).toBe(0.5);
  });
});
