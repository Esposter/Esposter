import type { ForgeOrder } from "#src/models/forging/ForgeOrder";
import type { ForgeRecipe } from "#src/models/forging/ForgeRecipe";
import type { ForgeTalent } from "#src/models/forging/ForgeTalent";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { WeaponData } from "#src/models/weapon/WeaponData";

import { Currency } from "#src/models/inventory/Currency";
import { gainAdventureExp } from "#src/services/adventureRank/gainAdventureExp";
import { collectForgeOrder } from "#src/services/forging/collectForgeOrder";

// Obtains a queue's order at `now`: the units done are taken in by collectForgeOrder, and the Adventure EXP they yield is
// Gained at the Adventure Rank as an Original Resin claim gains its own. The Mora the EXP past rank 60 pays goes into the
// Wallet, and the order left queued is what collectForgeOrder leaves
export const obtainForgeOrder = (
  recipe: ForgeRecipe,
  order: ForgeOrder,
  {
    adventureExp,
    completedMainQuestIds,
    definitions,
    inventory,
    now,
    random,
    talents,
    wallet,
    weapons,
  }: {
    adventureExp: number;
    completedMainQuestIds: ReadonlySet<string>;
    definitions: Map<number, ItemDefinition>;
    inventory: Inventory;
    now: Temporal.Instant;
    random: () => number;
    talents: ForgeTalent[];
    wallet: Wallet;
    weapons: Map<number, Pick<ItemDefinition, "name"> & WeaponData>;
  },
): { adventureExp: number; inventory: Inventory; order?: ForgeOrder; wallet: Wallet } => {
  const collected = collectForgeOrder(recipe, order, { definitions, inventory, now, random, talents, weapons });
  const gain = gainAdventureExp(adventureExp, collected.adventureExp, completedMainQuestIds);
  return {
    adventureExp: gain.adventureExp,
    inventory: collected.inventory,
    order: collected.order,
    wallet: { ...wallet, [Currency.Mora]: wallet[Currency.Mora] + gain.moraPaid },
  };
};
