import type { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import type { Character } from "#src/models/character/Character";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { ReliquarySetData } from "#src/models/reliquary/ReliquarySetData";

import { getArtifactItemDefinition } from "#src/services/artifact/getArtifactItemDefinition";
import { unequipCharacterArtifact } from "#src/services/artifact/unequipCharacterArtifact";
import { addInventoryArtifact } from "#src/services/inventory/addInventoryArtifact";

// A character takes off the artifact in a slot into the bag as an entry of its own. A bag with no room for it returns
// Nothing, and the artifact stays worn
export const unequipArtifactToBag = (
  inventory: Inventory,
  character: Character,
  slot: ArtifactSlot,
  options: { names: Readonly<Record<string, string>>; reliquarySets: readonly ReliquarySetData[] },
): { character: Character; inventory: Inventory } | undefined => {
  const { artifact, character: unequipped } = unequipCharacterArtifact(character, slot);
  const definition = getArtifactItemDefinition(artifact, options.reliquarySets, options.names);
  const { inventory: nextInventory, overflow } = addInventoryArtifact(inventory, definition, artifact);
  if (overflow) return undefined;
  return { character: unequipped, inventory: nextInventory };
};
