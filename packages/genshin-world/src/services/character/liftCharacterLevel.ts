import type { Character } from "#src/models/character/Character";
import type { MasterlessLevelLift } from "#src/models/character/MasterlessLevelLift";
import type { Inventory } from "#src/models/inventory/Inventory";

import { checkIsLiftHeld } from "#src/services/character/checkIsLiftHeld";
import { MASTERLESS_STELLA_FORTUNA_ID } from "#src/services/character/constants";
import { takeInventoryItems } from "#src/services/inventory/takeInventoryItems";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A character lifted past its level cap with Masterless Stella Fortuna, its level rising at once to the next cap and
// The Items the lift takes taken from the bag. A level no lift names, or a bag short of the items, is refused before
// Anything Is taken
export const liftCharacterLevel = (
  character: Character,
  { inventory, lifts }: { inventory: Inventory; lifts: ReadonlyMap<number, MasterlessLevelLift> },
): { character: Character; inventory: Inventory } => {
  const lift = lifts.get(character.level);
  if (!lift)
    throw new InvalidOperationError(Operation.Update, liftCharacterLevel.name, `level ${character.level} lift`);
  if (!checkIsLiftHeld(inventory, lift))
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
