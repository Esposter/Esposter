import type { Artifact } from "#src/models/artifact/Artifact";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";
import type { ReliquarySetData } from "#src/models/reliquary/ReliquarySetData";

import { toArtifactItemDefinition } from "#src/services/inventory/toArtifactItemDefinition";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A worn artifact's bag definition, rebuilt from the piece of its set its item id names, since a set holds one piece
// Per slot, rarity and starting minor affix count, and the artifact is the one it was rolled as. A set or piece the
// Tables do not hold is refused
export const getArtifactItemDefinition = (
  { itemId, setId }: Artifact,
  reliquarySets: readonly ReliquarySetData[],
  names: Readonly<Record<string, string>>,
): ItemDefinition => {
  const piece = reliquarySets.find(({ id }) => id === setId)?.pieces.find((candidate) => candidate.itemId === itemId);
  if (!piece)
    throw new InvalidOperationError(
      Operation.Read,
      getArtifactItemDefinition.name,
      `set ${setId} piece with item id ${itemId}`,
    );
  return toArtifactItemDefinition({ ...piece, setId }, names);
};
