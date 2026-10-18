import type { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import type { InventoryItem } from "#src/models/inventory/InventoryItem";
import type { ReliquaryPieceEntry } from "#src/models/reliquary/ReliquaryPieceEntry";

import { InvalidOperationError, Operation } from "@esposter/shared";
import { ItemCategory } from "genshin-interface";

// The set and slot of each artifact the bag holds, one per bag entry, read from the piece each entry is. An artifact whose
// Piece the tables lack is an error, as a bag entry the tables cannot name is everywhere
export const getArchiveArtifacts = (
  items: readonly InventoryItem[],
  reliquaryPieceEntryMap: ReadonlyMap<number, ReliquaryPieceEntry>,
): { setId: number; slot: ArtifactSlot }[] =>
  items.flatMap(({ definition }) => {
    if (definition.category !== ItemCategory.Artifact) return [];
    const piece = reliquaryPieceEntryMap.get(definition.id);
    if (piece === undefined)
      throw new InvalidOperationError(Operation.Read, String(definition.id), "is no piece of the reliquary tables");
    const { setId, slot } = piece;
    return [{ setId, slot }];
  });
