import { checkIsPaimonsBargainsFateGood } from "#src/services/genshinAssets/shops/checkIsPaimonsBargainsFateGood";
import { writeShopGoodSlice } from "#src/services/genshinAssets/shops/writeShopGoodSlice";

// Paimon's Bargains' Fates bought with Masterless Starglitter or Stardust, written as one slice in the World's generated folder
export const writePaimonsBargainsGoods = (): void => {
  writeShopGoodSlice(checkIsPaimonsBargainsFateGood, "paimonsBargains.json");
};
