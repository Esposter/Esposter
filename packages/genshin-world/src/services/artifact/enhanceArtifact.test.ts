import type { Artifact } from "#src/models/artifact/Artifact";
import type { ArtifactRarityData } from "#src/models/artifact/ArtifactRarityData";

import { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import { Attribute } from "#src/models/character/Attribute";
import { enhanceArtifact } from "#src/services/artifact/enhanceArtifact";
import { describe, expect, test } from "vitest";

// A draw of zero takes the first of each pool and the bonus of one, a draw of 0.95 the bonus of two
const random = () => 0;

describe(enhanceArtifact, () => {
  const RARITY = 5;
  const LEVEL_EXPERIENCE = 100;
  const rarityData: ArtifactRarityData = {
    affixLevels: [2],
    baseExperience: 40,
    levelExperiences: [LEVEL_EXPERIENCE, LEVEL_EXPERIENCE, LEVEL_EXPERIENCE],
    maxLevel: 3,
    minorAffixGroups: [
      { attribute: Attribute.Attack, values: [1, 2] },
      { attribute: Attribute.Health, values: [10, 20] },
      { attribute: Attribute.CriticalRate, values: [3, 4] },
      { attribute: Attribute.CriticalDamage, values: [5, 6] },
      { attribute: Attribute.Defense, values: [7, 8] },
    ],
    rarity: RARITY,
  };
  const artifactRarityDataMap = new Map([[RARITY, rarityData]]);
  const artifact: Artifact = {
    experience: 0,
    isLocked: false,
    level: 0,
    mainAffix: Attribute.Attack,
    minorAffixes: [],
    rarity: RARITY,
    setId: 1,
    slot: ArtifactSlot.PlumeOfDeath,
  };

  test("levels as far as its EXP reaches and adds a minor affix at an affix level it passes", () => {
    expect.hasAssertions();

    expect(
      enhanceArtifact({ artifact, artifactRarityDataMap, fodders: [], materialExperience: 250, random }),
    ).toStrictEqual({
      ...artifact,
      experience: 250,
      level: 2,
      minorAffixes: [{ attribute: Attribute.Health, value: 10 }],
    });
  });

  test("raises an evenly chosen minor affix by a tier once it has four", () => {
    expect.hasAssertions();

    const fullArtifact: Artifact = {
      ...artifact,
      experience: LEVEL_EXPERIENCE,
      level: 1,
      minorAffixes: [
        { attribute: Attribute.Health, value: 10 },
        { attribute: Attribute.CriticalRate, value: 3 },
        { attribute: Attribute.CriticalDamage, value: 5 },
        { attribute: Attribute.Defense, value: 7 },
      ],
    };

    expect(
      enhanceArtifact({
        artifact: fullArtifact,
        artifactRarityDataMap,
        fodders: [],
        materialExperience: LEVEL_EXPERIENCE,
        random,
      }).minorAffixes[0],
    ).toStrictEqual({ attribute: Attribute.Health, value: 20 });
  });

  test("multiplies the EXP it is fed by the bonus drawn, and spends none past its highest level", () => {
    expect.hasAssertions();

    expect(
      enhanceArtifact({ artifact, artifactRarityDataMap, fodders: [], materialExperience: 50, random: () => 0.95 })
        .level,
    ).toBe(1);
    expect(
      enhanceArtifact({ artifact, artifactRarityDataMap, fodders: [], materialExperience: 10_000, random }).experience,
    ).toBe(LEVEL_EXPERIENCE * rarityData.maxLevel);
  });
});
