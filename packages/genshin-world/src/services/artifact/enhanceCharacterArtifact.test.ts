import type { Artifact } from "#src/models/artifact/Artifact";
import type { ArtifactRarityData } from "#src/models/artifact/ArtifactRarityData";
import type { Character } from "#src/models/character/Character";

import { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import { Attribute } from "#src/models/character/Attribute";
import { CombatTalent } from "#src/models/character/CombatTalent";
import { Currency } from "#src/models/inventory/Currency";
import { enhanceCharacterArtifact } from "#src/services/artifact/enhanceCharacterArtifact";
import { EMPTY_WALLET } from "#src/services/inventory/constants";
import { describe, expect, test } from "vitest";

// A draw of zero takes the first of each pool and the bonus of one
const random = () => 0;

describe(enhanceCharacterArtifact, () => {
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
  const fodder: Artifact = { ...artifact, slot: ArtifactSlot.FlowerOfLife };
  const character: Character = {
    artifacts: [artifact],
    ascension: 0,
    constellationCount: 0,
    friendshipExp: 0,
    id: 1,
    level: 1,
    stellaFortunaCount: 0,
    talentLevels: {
      [CombatTalent.ElementalBurst]: 1,
      [CombatTalent.ElementalSkill]: 1,
      [CombatTalent.NormalAttack]: 1,
    },
    weapon: { ascension: 0, experience: 0, id: 1, level: 1, refinement: 1 },
  };

  test("a worn artifact takes the materials' EXP and its fodder's, and the Mora they cost is charged", () => {
    expect.hasAssertions();

    const wallet = { ...EMPTY_WALLET, [Currency.Mora]: 1000 };
    const result = enhanceCharacterArtifact(character, ArtifactSlot.PlumeOfDeath, {
      artifactRarityDataMap,
      fodders: [fodder],
      materialExperience: 250,
      random,
      wallet,
    });
    // The fodder's base EXP is 40 and costs a Mora a point, so 250 plus 40 is 290 Mora and 290 EXP, which levels the
    // Artifact twice and no further
    expect(result.wallet[Currency.Mora]).toBe(1000 - 290);
    expect(result.character.artifacts).toStrictEqual([
      { ...artifact, experience: 290, level: 2, minorAffixes: [{ attribute: Attribute.Health, value: 10 }] },
    ]);
  });

  test("an enhancement the wallet cannot pay for is refused", () => {
    expect.hasAssertions();

    const wallet = { ...EMPTY_WALLET, [Currency.Mora]: 100 };
    expect(() =>
      enhanceCharacterArtifact(character, ArtifactSlot.PlumeOfDeath, {
        artifactRarityDataMap,
        fodders: [fodder],
        materialExperience: 250,
        random,
        wallet,
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Update, name: enhanceCharacterArtifact, 290 Mora]`,
    );
  });

  test("an enhancement of an empty slot is refused", () => {
    expect.hasAssertions();

    const wallet = { ...EMPTY_WALLET, [Currency.Mora]: 1000 };
    expect(() =>
      enhanceCharacterArtifact(character, ArtifactSlot.SandsOfEon, {
        artifactRarityDataMap,
        fodders: [],
        materialExperience: 100,
        random,
        wallet,
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Update, name: enhanceCharacterArtifact, no artifact in EQUIP_SHOES]`,
    );
  });
});
