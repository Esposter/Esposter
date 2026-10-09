// The stock a fishing pool draws from by the time of day, spelt as the game's fish stock table spells it so its rows
// Parse straight in: the day's, the night's, or one held at every hour
export enum FishingStockType {
  Any = "FISH_STOCK_TYPE_ANY",
  Day = "FISH_STOCK_TYPE_DAY",
  Night = "FISH_STOCK_TYPE_NIGHT",
}
