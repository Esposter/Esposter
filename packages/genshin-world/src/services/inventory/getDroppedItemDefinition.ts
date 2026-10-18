import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { ReliquaryPieceEntry } from "#src/models/reliquary/ReliquaryPieceEntry";

import { getItemDefinition } from "#src/services/inventory/getItemDefinition";
import { toArtifactItemDefinition } from "#src/services/inventory/toArtifactItemDefinition";

// A dropped item's definition: an artifact piece's from the reliquary tables, which hold it apart from the materials, and
// Any other item's from the materials table
export const getDroppedItemDefinition = (
  itemId: number,
  names: Readonly<Record<string, string>>,
  materialDataMap: ReadonlyMap<number, MaterialData>,
  reliquaryPieceEntryMap: ReadonlyMap<number, ReliquaryPieceEntry>,
): ItemDefinition => {
  const piece = reliquaryPieceEntryMap.get(itemId);
  return piece === undefined
    ? getItemDefinition(itemId, names, materialDataMap)
    : toArtifactItemDefinition(piece, names);
};
