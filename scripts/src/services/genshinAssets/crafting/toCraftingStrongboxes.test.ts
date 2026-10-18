import type { ExcelDisplayItemRow } from "#src/models/genshinAssets/crafting/ExcelDisplayItemRow";
import type { ExcelReliquaryDecomposeRow } from "#src/models/genshinAssets/crafting/ExcelReliquaryDecomposeRow";
import type { ExcelReliquaryOfferPurchaseRow } from "#src/models/genshinAssets/crafting/ExcelReliquaryOfferPurchaseRow";
import type { ExcelRewardPreviewRow } from "#src/models/genshinAssets/expeditions/ExcelRewardPreviewRow";
import type { ExcelReliquaryRow } from "#src/models/genshinAssets/stats/ExcelReliquaryRow";

import { toCraftingStrongboxes } from "#src/services/genshinAssets/crafting/toCraftingStrongboxes";
import { describe, expect, test } from "vitest";

describe(toCraftingStrongboxes, () => {
  const SET_ID = 90_001;
  const DECOMPOSE_ID = 1;
  const PREVIEW_ID = 40_001;
  const DISPLAY_ITEM_ID = 419_001;
  const NAME_TEXT_HASH = 1001;
  const RARITY = 5;
  const FIRST_PIECE_ID = 90_101;
  const OTHER_SET_PIECE_ID = 90_201;
  const decomposeRow: ExcelReliquaryDecomposeRow = {
    id: DECOMPOSE_ID,
    needReliquaryCount: 3,
    needReliquaryRankLevel: RARITY,
    rewardPreviewId: PREVIEW_ID,
  };
  const previewRow: ExcelRewardPreviewRow = { id: PREVIEW_ID, previewItems: [{ id: DISPLAY_ITEM_ID }] };
  const displayItemRow: ExcelDisplayItemRow = {
    displayType: "RELIQUARY_ITEM_SMELT",
    id: DISPLAY_ITEM_ID,
    nameTextMapHash: NAME_TEXT_HASH,
    param: SET_ID,
  };
  const createReliquaryRow = (id: number, setId: number): ExcelReliquaryRow => ({
    addPropLevels: [],
    appendPropDepotId: 0,
    baseConvExp: 0,
    equipType: "EQUIP_BRACER",
    id,
    mainPropDepotId: 0,
    maxLevel: 20,
    nameTextMapHash: 0,
    rank: 10,
    rankLevel: RARITY,
    setId,
  });
  const reliquaryRows = [
    createReliquaryRow(FIRST_PIECE_ID, SET_ID),
    createReliquaryRow(FIRST_PIECE_ID + 1, SET_ID),
    createReliquaryRow(OTHER_SET_PIECE_ID, SET_ID + 1),
  ];
  const offerRow: ExcelReliquaryOfferPurchaseRow = {
    EPLFOBEBPPG: SET_ID,
    id: 1,
    AAAAAAAAAAA: [FIRST_PIECE_ID + 1, FIRST_PIECE_ID],
    BBBBBBBBBBB: [OTHER_SET_PIECE_ID, OTHER_SET_PIECE_ID],
    CCCCCCCCCCC: [6600, 3400],
  };

  test("a strongbox takes its set and pieces from its display item and offer row", () => {
    expect.hasAssertions();

    expect(
      toCraftingStrongboxes({
        decomposeRows: [decomposeRow],
        displayItemRows: [displayItemRow],
        offerRows: [offerRow],
        previewRows: [previewRow],
        reliquaryRows,
      }),
    ).toStrictEqual([
      {
        id: SET_ID,
        nameTextId: String(NAME_TEXT_HASH),
        needCount: 3,
        pieceItemIds: [FIRST_PIECE_ID, FIRST_PIECE_ID + 1],
        rarity: RARITY,
      },
    ]);
  });

  test("a strongbox with no offer row is left out", () => {
    expect.hasAssertions();

    expect(
      toCraftingStrongboxes({
        decomposeRows: [decomposeRow],
        displayItemRows: [displayItemRow],
        offerRows: [],
        previewRows: [previewRow],
        reliquaryRows,
      }),
    ).toStrictEqual([]);
  });
});
