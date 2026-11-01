import type { FishingWeight } from "#src/models/fishing/FishingWeight";

// A fish's weight in a stock, tagged with the key of the stock it is in, so a fish drawn from it names the stock it leaves
export interface FishingStockWeight extends FishingWeight {
  stockKey: string;
}
