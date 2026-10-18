import type { Artifact } from "#src/models/artifact/Artifact";
import type { Character } from "#src/models/character/Character";

import { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import { Attribute } from "#src/models/character/Attribute";
import { CombatTalent } from "#src/models/character/CombatTalent";
import { unequipCharacterArtifact } from "#src/services/artifact/unequipCharacterArtifact";
import { describe, expect, test } from "vitest";

describe(unequipCharacterArtifact, () => {
  const artifact: Artifact = {
    experience: 0,
    isLocked: false,
    level: 0,
    mainAffix: Attribute.Health,
    minorAffixes: [],
    rarity: 5,
    setId: 1,
    slot: ArtifactSlot.FlowerOfLife,
  };
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

  test("unequipping returns the worn artifact and leaves its slot empty", () => {
    expect.hasAssertions();

    expect(unequipCharacterArtifact(character, ArtifactSlot.FlowerOfLife)).toStrictEqual({
      artifact,
      character: { ...character, artifacts: [] },
    });
  });

  test("unequipping an empty slot is refused", () => {
    expect.hasAssertions();

    expect(() => unequipCharacterArtifact(character, ArtifactSlot.PlumeOfDeath)).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Update, name: unequipCharacterArtifact, no artifact in EQUIP_NECKLACE]`,
    );
  });
});
