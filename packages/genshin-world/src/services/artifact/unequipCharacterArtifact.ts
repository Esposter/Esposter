import type { Artifact } from "#src/models/artifact/Artifact";
import type { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import type { Character } from "#src/models/character/Character";

import { InvalidOperationError, Operation } from "@esposter/shared";

// A character takes off the artifact in a slot, which the caller puts back in the bag. A slot with no piece in it has
// Nothing to take off, and is refused
export const unequipCharacterArtifact = (
  character: Character,
  slot: ArtifactSlot,
): { artifact: Artifact; character: Character } => {
  const artifact = character.artifacts.find((worn) => worn.slot === slot);
  if (!artifact)
    throw new InvalidOperationError(Operation.Update, unequipCharacterArtifact.name, `no artifact in ${slot}`);
  return { artifact, character: { ...character, artifacts: character.artifacts.filter((worn) => worn !== artifact) } };
};
