import type { Artifact } from "#src/models/artifact/Artifact";
import type { ArtifactRarityData } from "#src/models/artifact/ArtifactRarityData";

import { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import { Attribute } from "#src/models/character/Attribute";
import { getFodderEnhancement } from "#src/services/artifact/getFodderEnhancement";
import { describe, expect, test } from "vitest";

describe(getFodderEnhancement, () => {
  const RARITY = 5;
  const BASE_EXPERIENCE = 40;
  const artifactRarityDataMap = new Map<number, ArtifactRarityData>([
    [
      RARITY,
      {
        affixLevels: [],
        baseExperience: BASE_EXPERIENCE,
        levelExperiences: [],
        maxLevel: 0,
        minorAffixGroups: [],
        rarity: RARITY,
      },
    ],
  ]);
  const fodder: Artifact = {
    experience: 100,
    isLocked: false,
    level: 0,
    mainAffix: Attribute.Attack,
    minorAffixes: [],
    rarity: RARITY,
    setId: 1,
    slot: ArtifactSlot.PlumeOfDeath,
  };

  test("gives its base and the recovered share of what it was levelled with, the base alone costing Mora", () => {
    expect.hasAssertions();

    expect(getFodderEnhancement(fodder, artifactRarityDataMap)).toStrictEqual({
      experience: BASE_EXPERIENCE + 80,
      mora: BASE_EXPERIENCE,
    });
  });

  test("refuses a locked artifact", () => {
    expect.hasAssertions();

    expect(() =>
      getFodderEnhancement({ ...fodder, isLocked: true }, artifactRarityDataMap),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Update, name: getFodderEnhancement, a locked artifact is never fodder]`,
    );
  });
});
