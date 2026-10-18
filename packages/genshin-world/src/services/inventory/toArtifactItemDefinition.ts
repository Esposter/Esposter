import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";
import type { ReliquaryPieceEntry } from "#src/models/reliquary/ReliquaryPieceEntry";

import { getItemName } from "#src/services/inventory/getItemName";
import { ItemCategory } from "genshin-interface";

// An artifact's definition in the reader's language, from its piece of the reliquary tables: an artifact is filed in the
// Artifact tab, is held one to a bag entry, and is named by its piece's text id
export const toArtifactItemDefinition = (
  piece: ReliquaryPieceEntry,
  names: Readonly<Record<string, string>>,
): ItemDefinition => ({
  category: ItemCategory.Artifact,
  id: piece.itemId,
  name: getItemName(piece.nameTextId, names),
  rank: piece.rank,
  rarity: piece.rarity,
  stackLimit: 1,
});
