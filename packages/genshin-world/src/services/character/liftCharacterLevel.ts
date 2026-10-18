import type { Character } from "#src/models/character/Character";
import type { Inventory } from "#src/models/inventory/Inventory";

import { MASTERLESS_LEVEL_LIFTS, MASTERLESS_STELLA_FORTUNA_ID } from "#src/services/character/constants";
import { checkIsItemCountsHeld } from "#src/services/inventory/checkIsItemCountsHeld";
import { takeInventoryItems } from "#src/services/inventory/takeInventoryItems";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A character lifted past its level cap with Masterless Stella Fortuna, its level rising at once to the next cap and the
// Items the lift takes taken from the bag. A level no lift names, or a bag short of the items, is refused before anything
// Is taken
export const liftCharacterLevel = (
  character: Character,
  { inventory }: { inventory: Inventory },
): { character: Character; inventory: Inventory } => {
  const lift = MASTERLESS_LEVEL_LIFTS.get(character.level);
  if (!lift)
    throw new InvalidOperationError(Operation.Update, liftCharacterLevel.name, `level ${character.level} lift`);
  if (!checkIsItemCountsHeld(inventory.items, [{ count: lift.count, id: MASTERLESS_STELLA_FORTUNA_ID }], 1))
    throw new InvalidOperationError(
      Operation.Update,
      liftCharacterLevel.name,
      `${lift.count} Masterless Stella Fortuna`,
    );
  return {
    character: { ...character, level: lift.level },
    inventory: { ...inventory, items: takeInventoryItems(inventory.items, MASTERLESS_STELLA_FORTUNA_ID, lift.count) },
  };
};
