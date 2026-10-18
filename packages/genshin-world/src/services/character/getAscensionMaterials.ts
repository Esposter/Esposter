import type { AscensionMaterial } from "#src/models/character/AscensionMaterial";
import type { CharacterAscensionPhase } from "#src/models/character/CharacterAscensionPhase";
import type { Inventory } from "#src/models/inventory/Inventory";

import { countInventoryItem } from "#src/services/inventory/countInventoryItem";

// The materials entering a phase takes, each with the count the player holds, for the Ascend panel to list. A phase
// Whose cost the table does not carry yet lists none
export const getAscensionMaterials = (
  phase: CharacterAscensionPhase | undefined,
  inventory: Inventory,
): AscensionMaterial[] =>
  (phase?.costItems ?? []).map(({ count, id }) => ({ count, held: countInventoryItem(inventory.items, id), id }));
