import type { Character } from "#src/models/character/Character";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { ReliquarySetData } from "#src/models/reliquary/ReliquarySetData";

import { equipCharacterArtifact } from "#src/services/artifact/equipCharacterArtifact";
import { getArtifactItemDefinition } from "#src/services/artifact/getArtifactItemDefinition";
import { addInventoryArtifact } from "#src/services/inventory/addInventoryArtifact";
import { takeInventoryEntry } from "#src/services/inventory/takeInventoryEntry";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A character wears the bag's artifact the player chose, by its entry. The piece it wore goes back to the bag as an entry
// Of its own. Taking the chosen entry out frees the room that piece needs, so it always fits
export const equipBagArtifact = (
  inventory: Inventory,
  character: Character,
  entryId: number,
  options: { names: Readonly<Record<string, string>>; reliquarySets: readonly ReliquarySetData[] },
): { character: Character; inventory: Inventory } => {
  const chosen = inventory.items.find(({ id }) => id === entryId)?.artifact;
  if (!chosen)
    throw new InvalidOperationError(Operation.Update, equipBagArtifact.name, `entry ${entryId} is not an artifact`);
  const items = takeInventoryEntry(inventory.items, entryId);
  const { character: equipped, displaced } = equipCharacterArtifact(character, chosen);
  if (!displaced) return { character: equipped, inventory: { ...inventory, items } };
  const definition = getArtifactItemDefinition(displaced, options.reliquarySets, options.names);
  const { inventory: nextInventory, overflow } = addInventoryArtifact({ ...inventory, items }, definition, displaced);
  if (overflow)
    throw new InvalidOperationError(
      Operation.Update,
      equipBagArtifact.name,
      "the bag has no room for the piece it wore",
    );
  return { character: equipped, inventory: nextInventory };
};
