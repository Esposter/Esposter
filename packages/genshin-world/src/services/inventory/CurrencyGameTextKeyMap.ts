import { Currency } from "#src/models/inventory/Currency";
import { GameTextKey } from "genshin-text";

// Each currency by its item's name in the game's text
export const CurrencyGameTextKeyMap = {
  [Currency.AcquaintFate]: GameTextKey.AcquaintFate,
  [Currency.AnemoSigil]: GameTextKey.AnemoSigil,
  [Currency.CryoSigil]: GameTextKey.CryoSigil,
  [Currency.DendroSigil]: GameTextKey.DendroSigil,
  [Currency.ElectroSigil]: GameTextKey.ElectroSigil,
  [Currency.GenesisCrystal]: GameTextKey.GenesisCrystal,
  [Currency.GeoSigil]: GameTextKey.GeoSigil,
  [Currency.HydroSigil]: GameTextKey.HydroSigil,
  [Currency.IntertwinedFate]: GameTextKey.IntertwinedFate,
  [Currency.LunaSigil]: GameTextKey.LunaSigil,
  [Currency.MasterlessStardust]: GameTextKey.MasterlessStardust,
  [Currency.MasterlessStarglitter]: GameTextKey.MasterlessStarglitter,
  [Currency.MasterlessStellaFortuna]: GameTextKey.MasterlessStellaFortuna,
  [Currency.Mora]: GameTextKey.Mora,
  [Currency.OriginalResin]: GameTextKey.OriginalResin,
  [Currency.Primogem]: GameTextKey.Primogem,
  [Currency.PyroSigil]: GameTextKey.PyroSigil,
  [Currency.RealmCurrency]: GameTextKey.RealmCurrency,
} as const satisfies Record<Currency, GameTextKey>;
