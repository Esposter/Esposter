import type { CookingProgress } from "#src/models/cooking/CookingProgress";
import type { CookingRecipe } from "#src/models/cooking/CookingRecipe";
import type { DishUse } from "#src/models/cooking/DishUse";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { KitContext } from "#src/models/kit/KitContext";
import type { Party } from "#src/models/party/Party";
import type { Ref } from "vue";

// What using a bag entry reads and writes: the bag, the wallet and the cooking the use pays into, the dishes and recipes
// Its entry is read as, and the party and the kit's effects a dish or a food acts on
export interface WorldBagUseOptions {
  cookingProgress: Ref<CookingProgress>;
  dishUseMap: Readonly<Ref<ReadonlyMap<number, DishUse>>>;
  getMemberMaxHealth: (characterId: number) => number | undefined;
  getWorldNow: () => Temporal.Instant;
  instructionRecipeMap: Readonly<Ref<ReadonlyMap<number, CookingRecipe>>>;
  inventory: Readonly<Ref<Inventory>>;
  kitContext: KitContext;
  party: Party;
  setInventory: (inventory: Inventory) => void;
  setWallet: (wallet: Wallet) => void;
  wallet: Readonly<Ref<Wallet>>;
}
