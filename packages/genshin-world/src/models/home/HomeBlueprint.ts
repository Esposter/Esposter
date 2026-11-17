import type { ItemCount } from "#src/models/inventory/ItemCount";

// One furnishing Tubby makes, keyed by the furnishing's item id: the materials one unit takes, the seconds it takes, the Trust
// EXP its first making gives, and the diagrams that open it. A blueprint no diagram opens is open from the start
export interface HomeBlueprint {
  id: number;
  materials: ItemCount[];
  seconds: number;
  trustExp: number;
  unlockItemIds: number[];
}
