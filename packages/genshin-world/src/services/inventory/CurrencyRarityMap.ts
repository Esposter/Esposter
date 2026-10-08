import { Currency } from "#src/models/inventory/Currency";

// Each currency's rarity in stars, which the background of its cell in the Precious Items tab shows
export const CurrencyRarityMap = {
  [Currency.AcquaintFate]: 5,
  [Currency.GenesisCrystal]: 5,
  [Currency.IntertwinedFate]: 5,
  [Currency.MasterlessStardust]: 4,
  [Currency.MasterlessStarglitter]: 5,
  [Currency.MasterlessStellaFortuna]: 5,
  [Currency.Mora]: 3,
  [Currency.OriginalResin]: 3,
  [Currency.Primogem]: 5,
} as const satisfies Record<Currency, number>;
