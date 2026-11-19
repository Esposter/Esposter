import type { InteractiveMapLabel } from "#src/models/genshinAssets/points/InteractiveMapLabel";

import { ENV_ANIMAL_GATHER_TABLE_NAME } from "#src/services/genshinAssets/materialSources/constants";
import { readMaterialSourceItemIdMap } from "#src/services/genshinAssets/materialSources/readMaterialSourceItemIdMap";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { describe, expect, test, vi } from "vitest";

const { CRAB_ITEM_ID, CRAB_LABEL_ID, CRAB_NAME, CRAB_NAME_HASH, describeRows, gatherRows } = vi.hoisted(() => {
  const crabAnimalId = 28010101;
  const crabItemId = 100073;
  const crabNameHash = 1;
  return {
    CRAB_ITEM_ID: crabItemId,
    CRAB_LABEL_ID: 275,
    CRAB_NAME: "Pale Red Crab",
    CRAB_NAME_HASH: crabNameHash,
    describeRows: [{ id: crabAnimalId, nameTextMapHash: crabNameHash }],
    gatherRows: [{ animalId: crabAnimalId, gatherItemList: [{ count: 1, id: crabItemId }] }],
  };
});

vi.mock(import("#src/services/genshinText/readExcelTable"), () => ({ readExcelTable: vi.fn() }));
vi.mock(import("#src/services/genshinText/readTextMap"), () => ({
  readTextMap: () => new Map([[String(CRAB_NAME_HASH), CRAB_NAME]]),
}));

describe(readMaterialSourceItemIdMap, () => {
  test("a critter label joins the item its gather row gives", () => {
    expect.hasAssertions();
    vi.mocked(readExcelTable).mockImplementation((name) =>
      name === ENV_ANIMAL_GATHER_TABLE_NAME ? gatherRows : describeRows,
    );

    const labels: InteractiveMapLabel[] = [{ children: [], id: CRAB_LABEL_ID, name: CRAB_NAME }];

    expect(readMaterialSourceItemIdMap(labels).itemIdMap).toStrictEqual(new Map([[CRAB_LABEL_ID, CRAB_ITEM_ID]]));
  });
});
