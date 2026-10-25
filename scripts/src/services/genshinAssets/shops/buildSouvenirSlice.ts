import type { ExcelShopGoodsRow } from "#src/models/genshinAssets/shops/ExcelShopGoodsRow";

import { buildShopGoodSlice } from "#src/services/genshinAssets/shops/buildShopGoodSlice";
import { getShopGoodCosts } from "#src/services/genshinAssets/shops/getShopGoodCosts";

export const buildSouvenirSlice = (sigilItemId: number, stem: string): Record<string, unknown> =>
  buildShopGoodSlice(
    (row: ExcelShopGoodsRow) => getShopGoodCosts(row).some(({ itemId }) => itemId === sigilItemId),
    stem,
  );
