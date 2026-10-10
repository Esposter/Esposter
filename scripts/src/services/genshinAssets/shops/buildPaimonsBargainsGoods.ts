import { buildShopGoodSlice } from "#src/services/genshinAssets/shops/buildShopGoodSlice";
import { checkIsPaimonsBargainsFateGood } from "#src/services/genshinAssets/shops/checkIsPaimonsBargainsFateGood";

// Paimon's Bargains' Fates bought with Masterless Starglitter or Stardust, as one record of the shops dataset
export const buildPaimonsBargainsGoods = (): Record<string, unknown> =>
  buildShopGoodSlice(checkIsPaimonsBargainsFateGood, "paimonsBargains");
