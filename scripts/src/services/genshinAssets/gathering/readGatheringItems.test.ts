import type { GatherRow } from "#src/models/genshinAssets/gathering/GatherRow";
import type { MaterialRow } from "#src/models/genshinAssets/items/MaterialRow";
import type { InteractiveMapLabel } from "#src/models/genshinAssets/points/InteractiveMapLabel";

import { GATHER_POINT_LOCATION_GROUND, GATHER_TABLE_NAME } from "#src/services/genshinAssets/gathering/constants";
import { readGatheringItems } from "#src/services/genshinAssets/gathering/readGatheringItems";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { readTextMap } from "#src/services/genshinText/readTextMap";
import { GameTextKey } from "genshin-text";
import { GatheringRespawn, MaterialType } from "genshin-world";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/genshinText/readExcelTable"), () => ({
  readExcelTable: vi.fn<(name: string) => never[]>(),
}));
vi.mock(import("#src/services/genshinText/readTextMap"), () => ({ readTextMap: vi.fn<() => Map<string, string>>() }));

describe(readGatheringItems, () => {
  const ITEM_ID = 101;

  const ITEM_LABEL_ID = 63;

  const ITEM_NAME = "Test Ore";

  // The inventory category the official map files its labels under, whose labels respawn daily
  const INVENTORY_LABEL_ID = 60;

  const NAME_TEXT_KEY = GameTextKey.AcquaintFate;

  const labels: InteractiveMapLabel[] = [
    {
      children: [{ children: [], id: ITEM_LABEL_ID, name: ITEM_NAME }],
      id: INVENTORY_LABEL_ID,
      name: "Inventory / Materials",
    },
  ];

  const materialRow: MaterialRow = {
    foodQuality: "",
    id: ITEM_ID,
    itemUse: [],
    materialType: MaterialType.Exchange,
    nameTextMapHash: Number(NAME_TEXT_KEY),
    rank: 1,
    rankLevel: 1,
    stackLimit: 1,
  };

  const readGatherRows = (gatherRows: GatherRow[]) =>
    vi.mocked(readExcelTable).mockImplementation((name) => (name === GATHER_TABLE_NAME ? gatherRows : [materialRow]));

  beforeEach(() => {
    vi.mocked(readTextMap).mockReturnValue(new Map([[NAME_TEXT_KEY, ITEM_NAME]]));
  });

  test("should read a row the dump leaves its point location out of as picked off the ground", () => {
    expect.hasAssertions();
    readGatherRows([{ itemId: ITEM_ID, saveType: "GATHER_SAVE_TYPE_OWN" }]);
    expect(readGatheringItems(labels)).toStrictEqual({
      items: [
        {
          id: ITEM_ID,
          materialType: MaterialType.Exchange,
          nameTextId: NAME_TEXT_KEY,
          rank: 1,
          rarity: 1,
          respawn: GatheringRespawn.Daily,
          stackLimit: 1,
        },
      ],
      labelItemIdMap: new Map([[ITEM_LABEL_ID, ITEM_ID]]),
    });
  });

  test("should leave out a ground row the dump leaves its save type out of, as it saves nothing", () => {
    expect.hasAssertions();
    readGatherRows([{ itemId: ITEM_ID, pointLocation: GATHER_POINT_LOCATION_GROUND }]);
    expect(readGatheringItems(labels)).toStrictEqual({ items: [], labelItemIdMap: new Map() });
  });
});
