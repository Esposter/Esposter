import type { ExcelDisplayItemRow } from "#src/models/genshinAssets/crafting/ExcelDisplayItemRow";
import type { ExcelReliquaryDecomposeRow } from "#src/models/genshinAssets/crafting/ExcelReliquaryDecomposeRow";
import type { ExcelReliquaryOfferPurchaseRow } from "#src/models/genshinAssets/crafting/ExcelReliquaryOfferPurchaseRow";
import type { ExcelReliquaryRow } from "#src/models/genshinAssets/stats/ExcelReliquaryRow";
import type { ExcelRewardPreviewRow } from "#src/models/genshinAssets/expeditions/ExcelRewardPreviewRow";
import type { CraftingStrongbox } from "genshin-world";

import { RELIQUARY_SMELT_DISPLAY_TYPE } from "#src/services/genshinAssets/crafting/constants";

export interface StrongboxTables {
  decomposeRows: ExcelReliquaryDecomposeRow[];
  displayItemRows: ExcelDisplayItemRow[];
  offerRows: ExcelReliquaryOfferPurchaseRow[];
  previewRows: ExcelRewardPreviewRow[];
  reliquaryRows: ExcelReliquaryRow[];
}

// A pair of item ids under one of an offer row's keys, which the offer's per-slot lists are, read by shape
const isItemIdPair = (value: unknown): value is number[] =>
  Array.isArray(value) && value.length === 2 && value.every((item) => typeof item === "number");

// The strongboxes the Mystic Offering makes, one per set a display item names. Each is joined from the decompose row that
// Recipes it, the reward preview of that row, the display item its first item shows and the offer row linked to the set.
// Its pieces are the offer row's pieces of its set at the recipe's star rank, and a strongbox no offer row lists is left
// Out. The result is sorted by set id
export const toCraftingStrongboxes = ({
  decomposeRows,
  displayItemRows,
  offerRows,
  previewRows,
  reliquaryRows,
}: StrongboxTables): CraftingStrongbox[] => {
  const previewMap = new Map(previewRows.map((row) => [row.id, row]));
  const displayItemMap = new Map(
    displayItemRows.filter((row) => row.displayType === RELIQUARY_SMELT_DISPLAY_TYPE).map((row) => [row.id, row]),
  );
  const reliquaryMap = new Map(reliquaryRows.map((row) => [row.id, row]));
  return decomposeRows
    .flatMap((decomposeRow) => {
      const previewItemId = previewMap.get(decomposeRow.rewardPreviewId)?.previewItems[0]?.id;
      const displayItem = previewItemId === undefined ? undefined : displayItemMap.get(previewItemId);
      if (displayItem === undefined) return [];
      const offerRow = offerRows.find((row) => row.EPLFOBEBPPG === displayItem.param);
      if (offerRow === undefined) return [];
      const pieceItemIds = Object.values(offerRow)
        .filter((value) => isItemIdPair(value))
        .flat()
        .filter((itemId) => {
          const piece = reliquaryMap.get(itemId);
          return piece?.setId === displayItem.param && piece.rankLevel === decomposeRow.needReliquaryRankLevel;
        })
        .toSorted((firstId, secondId) => firstId - secondId);
      if (pieceItemIds.length === 0) return [];
      return [
        {
          id: displayItem.param,
          nameTextId: String(displayItem.nameTextMapHash),
          needCount: decomposeRow.needReliquaryCount,
          pieceItemIds,
          rarity: decomposeRow.needReliquaryRankLevel,
        },
      ];
    })
    .toSorted((firstStrongbox, secondStrongbox) => firstStrongbox.id - secondStrongbox.id);
};
