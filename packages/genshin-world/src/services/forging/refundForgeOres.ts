import type { ForgeRecipe } from "#src/models/forging/ForgeRecipe";
import type { ForgeTalent } from "#src/models/forging/ForgeTalent";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";

import { ForgeTalentKind } from "#src/models/forging/ForgeTalent";
import { FORGE_ORE_ITEM_IDS } from "#src/services/forging/constants";
import { addInventoryItem } from "#src/services/inventory/addInventoryItem";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The bag after the ores that the refund talents of a recipe's forge give back, each ore refunded its talent's share of what
// The `count` units took. A refund the bag has no room for is lost, as the game's own refund is
export const refundForgeOres = (
  inventory: Inventory,
  recipe: ForgeRecipe,
  count: number,
  talents: ForgeTalent[],
  definitions: Map<number, ItemDefinition>,
): Inventory =>
  talents
    .filter(({ kind }) => kind === ForgeTalentKind.RefundOre)
    .reduce(
      (bag, { ratio }) =>
        recipe.materials
          .filter(({ id }) => FORGE_ORE_ITEM_IDS.includes(id))
          .reduce((refundedBag, { count: perUnit, id }) => {
            const definition = definitions.get(id);
            if (!definition) throw new InvalidOperationError(Operation.Read, String(id), "has no definition to refund");
            return addInventoryItem(refundedBag, definition, Math.floor(perUnit * count * ratio)).inventory;
          }, bag),
      inventory,
    );
