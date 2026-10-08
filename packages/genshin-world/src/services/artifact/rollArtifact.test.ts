import type { ArtifactRarityData } from "#src/models/artifact/ArtifactRarityData";

import { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import { Attribute } from "#src/models/character/Attribute";
import { rollArtifact } from "#src/services/artifact/rollArtifact";
import { describe, expect, test } from "vitest";

describe(rollArtifact, () => {
  const RARITY = 5;
  const SET_ID = 1;
  const rarityData: ArtifactRarityData = {
    affixLevels: [4],
    baseExperience: 100,
    levelExperiences: [50, 50],
    maxLevel: 2,
    minorAffixGroups: [
      { attribute: Attribute.Attack, values: [1, 2] },
      { attribute: Attribute.Health, values: [10, 20] },
      { attribute: Attribute.CriticalRate, values: [3, 4] },
    ],
    rarity: RARITY,
  };
  const mainAffixPool = { attributes: [Attribute.Attack], slot: ArtifactSlot.PlumeOfDeath };

  test("draws the main affix from its slot's pool and the minor affixes from the rest of the rarity's", () => {
    expect.hasAssertions();

    expect(
      rollArtifact({ mainAffixPool, minorAffixCount: 2, random: () => 0, rarityData, setId: SET_ID }),
    ).toStrictEqual({
      experience: 0,
      isLocked: false,
      level: 0,
      mainAffix: Attribute.Attack,
      minorAffixes: [
        { attribute: Attribute.Health, value: 10 },
        { attribute: Attribute.CriticalRate, value: 3 },
      ],
      rarity: RARITY,
      setId: SET_ID,
      slot: ArtifactSlot.PlumeOfDeath,
    });
  });

  test("values a minor affix by a tier drawn evenly from its tiers", () => {
    expect.hasAssertions();

    expect(
      rollArtifact({ mainAffixPool, minorAffixCount: 1, random: () => 0.99, rarityData, setId: SET_ID }).minorAffixes,
    ).toStrictEqual([{ attribute: Attribute.CriticalRate, value: 4 }]);
  });
});
