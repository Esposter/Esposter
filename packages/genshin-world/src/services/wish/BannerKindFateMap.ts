import { Currency } from "#src/models/inventory/Currency";
import { BannerKind } from "genshin-interface";

// The Fate each kind of wish spends, one a wish
export const BannerKindFateMap = {
  [BannerKind.Beginners]: Currency.AcquaintFate,
  [BannerKind.CharacterEvent]: Currency.IntertwinedFate,
  [BannerKind.Standard]: Currency.AcquaintFate,
  [BannerKind.WeaponEvent]: Currency.IntertwinedFate,
} as const satisfies Record<BannerKind, Currency>;
