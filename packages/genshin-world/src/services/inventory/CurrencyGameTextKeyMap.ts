import { Currency } from "#src/models/inventory/Currency";
import { GameTextKey } from "genshin-text";

// Each currency by its item's name in the game's text
export const CurrencyGameTextKeyMap = {
  [Currency.AcquaintFate]: GameTextKey.AcquaintFate,
  [Currency.GenesisCrystal]: GameTextKey.GenesisCrystal,
  [Currency.IntertwinedFate]: GameTextKey.IntertwinedFate,
  [Currency.MasterlessStardust]: GameTextKey.MasterlessStardust,
  [Currency.MasterlessStarglitter]: GameTextKey.MasterlessStarglitter,
  [Currency.Mora]: GameTextKey.Mora,
  [Currency.Primogem]: GameTextKey.Primogem,
} as const satisfies Record<Currency, GameTextKey>;
