import type { ExcelDisplayItemRow } from "#src/models/genshinAssets/crafting/ExcelDisplayItemRow";
import type { ExcelReliquaryDecomposeRow } from "#src/models/genshinAssets/crafting/ExcelReliquaryDecomposeRow";
import type { ExcelReliquaryOfferPurchaseRow } from "#src/models/genshinAssets/crafting/ExcelReliquaryOfferPurchaseRow";
import type { ExcelReliquaryRow } from "#src/models/genshinAssets/stats/ExcelReliquaryRow";
import type { ExcelRewardPreviewRow } from "#src/models/genshinAssets/expeditions/ExcelRewardPreviewRow";

import {
  DECOMPOSE_TABLE_NAME,
  DISPLAY_ITEM_TABLE_NAME,
  OFFER_PURCHASE_TABLE_NAME,
} from "#src/services/genshinAssets/crafting/constants";
import { toCraftingStrongboxes } from "#src/services/genshinAssets/crafting/toCraftingStrongboxes";
import { RELIQUARY_TABLE_NAME } from "#src/services/genshinAssets/archive/constants";
import { REWARD_PREVIEW_TABLE_NAME } from "#src/services/genshinAssets/domains/constants";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { GameDataset } from "genshin-world";

// The Mystic Offering's strongboxes from the game's decompose, reward preview, display item, offer and reliquary tables,
// Published under the crafting dataset beside the recipes
export const buildCraftingStrongboxes = (): Record<string, unknown> => ({
  [`${GameDataset.Crafting}/strongboxes`]: toCraftingStrongboxes({
    decomposeRows: readExcelTable<ExcelReliquaryDecomposeRow>(DECOMPOSE_TABLE_NAME),
    displayItemRows: readExcelTable<ExcelDisplayItemRow>(DISPLAY_ITEM_TABLE_NAME),
    offerRows: readExcelTable<ExcelReliquaryOfferPurchaseRow>(OFFER_PURCHASE_TABLE_NAME),
    previewRows: readExcelTable<ExcelRewardPreviewRow>(REWARD_PREVIEW_TABLE_NAME),
    reliquaryRows: readExcelTable<ExcelReliquaryRow>(RELIQUARY_TABLE_NAME),
  }),
});
