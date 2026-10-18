import type { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import type { Character } from "#src/models/character/Character";

import { InvalidOperationError, Operation } from "@esposter/shared";

// A worn artifact is locked or unlocked in its slot, so fodder never takes it. A slot with no piece in it is refused
export const toggleCharacterArtifactLock = (character: Character, slot: ArtifactSlot): Character => {
  const worn = character.artifacts.find((artifact) => artifact.slot === slot);
  if (!worn)
    throw new InvalidOperationError(Operation.Update, toggleCharacterArtifactLock.name, `no artifact in ${slot}`);
  return {
    ...character,
    artifacts: character.artifacts.map((artifact) =>
      artifact === worn ? { ...artifact, isLocked: !artifact.isLocked } : artifact,
    ),
  };
};
