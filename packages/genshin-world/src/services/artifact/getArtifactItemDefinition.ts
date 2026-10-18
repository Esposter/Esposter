import type { Artifact } from "#src/models/artifact/Artifact";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";
import type { ReliquarySetData } from "#src/models/reliquary/ReliquarySetData";

import { toArtifactItemDefinition } from "#src/services/inventory/toArtifactItemDefinition";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A worn artifact's bag definition, rebuilt from its set's piece of its slot and rarity, since a worn piece keeps no item
// Id of its own. A set holds one piece a slot, so the piece is the one matching both, and a set or piece the tables do not
// Hold is refused
export const getArtifactItemDefinition = (
  { rarity, setId, slot }: Artifact,
  reliquarySets: readonly ReliquarySetData[],
  names: Readonly<Record<string, string>>,
): ItemDefinition => {
  const piece = reliquarySets
    .find(({ id }) => id === setId)
    ?.pieces.find((candidate) => candidate.slot === slot && candidate.rarity === rarity);
  if (!piece)
    throw new InvalidOperationError(
      Operation.Read,
      getArtifactItemDefinition.name,
      `set ${setId} piece for ${slot} at rarity ${rarity}`,
    );
  return toArtifactItemDefinition({ ...piece, setId }, names);
};
