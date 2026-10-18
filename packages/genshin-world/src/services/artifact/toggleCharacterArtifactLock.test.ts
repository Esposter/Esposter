import type { Artifact } from "#src/models/artifact/Artifact";
import type { Character } from "#src/models/character/Character";

import { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import { Attribute } from "#src/models/character/Attribute";
import { CombatTalent } from "#src/models/character/CombatTalent";
import { toggleCharacterArtifactLock } from "#src/services/artifact/toggleCharacterArtifactLock";
import { describe, expect, test } from "vitest";

const createArtifact = (): Artifact => ({
  experience: 0,
  isLocked: false,
  level: 0,
  mainAffix: Attribute.Health,
  minorAffixes: [],
  rarity: 5,
  setId: 1,
  slot: ArtifactSlot.FlowerOfLife,
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

describe(toggleCharacterArtifactLock, () => {
  test("toggling a worn artifact locks it, and toggling it again unlocks it", () => {
    expect.hasAssertions();

    const character = createCharacter([createArtifact()]);
    const locked = toggleCharacterArtifactLock(character, ArtifactSlot.FlowerOfLife);
    expect(locked).toStrictEqual(createCharacter([{ ...createArtifact(), isLocked: true }]));
    expect(toggleCharacterArtifactLock(locked, ArtifactSlot.FlowerOfLife)).toStrictEqual(character);
  });

  test("toggling an empty slot is refused", () => {
    expect.hasAssertions();

    expect(() =>
      toggleCharacterArtifactLock(createCharacter([]), ArtifactSlot.FlowerOfLife),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Update, name: toggleCharacterArtifactLock, no artifact in EQUIP_BRACER]`,
    );
  });
});
