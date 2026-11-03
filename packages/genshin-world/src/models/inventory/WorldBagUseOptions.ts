import type { DishUse } from "#src/models/cooking/DishUse";
import type { KitContext } from "#src/models/kit/KitContext";
import type { Ref } from "vue";

// What using a bag entry reads and writes beside the bag, the wallet and the cooking the stores hold: the dishes its entry
// Is read as, and the kit's effects a dish or a food acts on
export interface WorldBagUseOptions {
  dishUseMap: Readonly<Ref<ReadonlyMap<number, DishUse>>>;
  getMemberMaxHealth: (characterId: number) => number | undefined;
  kitContext: KitContext;
}
