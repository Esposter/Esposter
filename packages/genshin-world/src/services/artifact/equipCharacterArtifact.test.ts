import type { Artifact } from "#src/models/artifact/Artifact";
import type { Character } from "#src/models/character/Character";

import { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import { Attribute } from "#src/models/character/Attribute";
import { CombatTalent } from "#src/models/character/CombatTalent";
import { equipCharacterArtifact } from "#src/services/artifact/equipCharacterArtifact";
import { describe, expect, test } from "vitest";

const createArtifact = (slot: ArtifactSlot, level = 0): Artifact => ({
  experience: 0,
  isLocked: false,
  level,
  mainAffix: Attribute.Health,
  minorAffixes: [],
  rarity: 5,
  setId: 1,
  slot,
});

const createCharacter = (artifacts: Artifact[]): Character => ({
  artifacts,
  ascension: 0,
  constellationCount: 0,
  friendshipExp: 0,
  id: 1,
  level: 1,
  stellaFortunaCount: 0,
  talentLevels: { [CombatTalent.ElementalBurst]: 1, [CombatTalent.ElementalSkill]: 1, [CombatTalent.NormalAttack]: 1 },
  weapon: { ascension: 0, experience: 0, id: 1, level: 1, refinement: 1 },
});

describe(equipCharacterArtifact, () => {
  test("equipping into an empty slot displaces nothing", () => {
    expect.hasAssertions();

    const artifact = createArtifact(ArtifactSlot.FlowerOfLife);
    expect(equipCharacterArtifact(createCharacter([]), artifact)).toStrictEqual({
      character: createCharacter([artifact]),
      displaced: undefined,
    });
  });

  test("equipping into a worn slot returns the piece it replaces", () => {
    expect.hasAssertions();

    const worn = createArtifact(ArtifactSlot.FlowerOfLife, 4);
    const replacement = createArtifact(ArtifactSlot.FlowerOfLife, 8);
    expect(equipCharacterArtifact(createCharacter([worn]), replacement)).toStrictEqual({
      character: createCharacter([replacement]),
      displaced: worn,
    });
  });
});
