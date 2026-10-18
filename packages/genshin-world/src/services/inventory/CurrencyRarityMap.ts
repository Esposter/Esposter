import { Currency } from "#src/models/inventory/Currency";

// Each currency's rarity in stars, which the background of its cell in the Precious Items tab shows
export const CurrencyRarityMap = {
  [Currency.AcquaintFate]: 5,
  [Currency.AnemoSigil]: 3,
  [Currency.CryoSigil]: 3,
  [Currency.DendroSigil]: 3,
  [Currency.ElectroSigil]: 3,
  [Currency.GenesisCrystal]: 5,
  [Currency.GeoSigil]: 3,
  [Currency.HydroSigil]: 3,
  [Currency.IntertwinedFate]: 5,
  [Currency.LunaSigil]: 3,
  [Currency.MasterlessStardust]: 4,
  [Currency.MasterlessStarglitter]: 5,
  [Currency.MasterlessStellaFortuna]: 5,
  [Currency.Mora]: 3,
  [Currency.OriginalResin]: 3,
  [Currency.Primogem]: 5,
  [Currency.PyroSigil]: 3,
  [Currency.RealmCurrency]: 3,
} as const satisfies Record<Currency, number>;
