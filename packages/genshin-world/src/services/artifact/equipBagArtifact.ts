import type { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import type { Character } from "#src/models/character/Character";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { ReliquarySetData } from "#src/models/reliquary/ReliquarySetData";

import { equipCharacterArtifact } from "#src/services/artifact/equipCharacterArtifact";
import { getArtifactItemDefinition } from "#src/services/artifact/getArtifactItemDefinition";
import { addInventoryArtifact } from "#src/services/inventory/addInventoryArtifact";
import { takeInventoryEntry } from "#src/services/inventory/takeInventoryEntry";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A character wears the bag's best piece for a slot, the highest rarity and then the highest level. The piece it wore goes
// Back to the bag as an entry of its own. The piece taken out freed the room that one needs, so it always fits
export const equipBagArtifact = (
  inventory: Inventory,
  character: Character,
  slot: ArtifactSlot,
  options: { names: Readonly<Record<string, string>>; reliquarySets: readonly ReliquarySetData[] },
): { character: Character; inventory: Inventory } => {
  const pieces = inventory.items.flatMap(({ artifact, id }) => (artifact?.slot === slot ? [{ artifact, id }] : []));
  const best = pieces.toSorted(
    (a, b) => b.artifact.rarity - a.artifact.rarity || b.artifact.level - a.artifact.level,
  )[0];
  if (!best)
    throw new InvalidOperationError(Operation.Update, equipBagArtifact.name, `no artifact for ${slot} in the bag`);
  const items = takeInventoryEntry(inventory.items, best.id);
  const { character: equipped, displaced } = equipCharacterArtifact(character, best.artifact);
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
