import type { FishingStockType } from "genshin-world";

// One stock of the game's fish stock table: the kind of time it is drawn in, and each fish's weight in it, keyed by the
// Fish's id as the table spells it
export interface ExcelFishStockRow {
  fishWeight: Record<string, number>;
  id: number;
  type: FishingStockType;
}
