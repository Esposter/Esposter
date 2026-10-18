import type { ExcelShopGoodsRow } from "#src/models/genshinAssets/shops/ExcelShopGoodsRow";

import { SOUVENIR_SIGIL_ITEM_IDS } from "#src/services/genshinAssets/shops/constants";
import { buildShopGoodSlice } from "#src/services/genshinAssets/shops/buildShopGoodSlice";
import { getShopGoodPrice } from "#src/services/genshinAssets/shops/getShopGoodPrice";

// The Souvenir Shops' goods, one record of the shops dataset for each region, the goods priced in that region's Sigil
export const buildSouvenirGoods = (): Record<string, unknown> => ({
  ...buildSouvenirSlice(SOUVENIR_SIGIL_ITEM_IDS.mondstadt, "souvenirMondstadt"),
  ...buildSouvenirSlice(SOUVENIR_SIGIL_ITEM_IDS.liyue, "souvenirLiyue"),
});

const buildSouvenirSlice = (sigilItemId: number, stem: string): Record<string, unknown> =>
  buildShopGoodSlice((row: ExcelShopGoodsRow) => getShopGoodPrice(row)?.id === sigilItemId, stem);
