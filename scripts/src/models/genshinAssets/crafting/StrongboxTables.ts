import type { ExcelDisplayItemRow } from "#src/models/genshinAssets/crafting/ExcelDisplayItemRow";
import type { ExcelReliquaryDecomposeRow } from "#src/models/genshinAssets/crafting/ExcelReliquaryDecomposeRow";
import type { ExcelReliquaryOfferPurchaseRow } from "#src/models/genshinAssets/crafting/ExcelReliquaryOfferPurchaseRow";
import type { ExcelRewardPreviewRow } from "#src/models/genshinAssets/shared/ExcelRewardPreviewRow";
import type { ExcelReliquaryRow } from "#src/models/genshinAssets/stats/ExcelReliquaryRow";

// The dump's tables a crafting strongbox is joined from
export interface StrongboxTables {
  decomposeRows: ExcelReliquaryDecomposeRow[];
  displayItemRows: ExcelDisplayItemRow[];
  offerRows: ExcelReliquaryOfferPurchaseRow[];
  previewRows: ExcelRewardPreviewRow[];
  reliquaryRows: ExcelReliquaryRow[];
}
