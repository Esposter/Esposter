import type { InteractiveMapLabel } from "#src/models/genshinAssets/points/InteractiveMapLabel";

import { ANIMAL_DESCRIBE_TABLE_NAME } from "#src/services/genshinAssets/archive/constants";
import { MATERIAL_TABLE_NAME } from "#src/services/genshinAssets/items/constants";
import { ENV_ANIMAL_GATHER_TABLE_NAME } from "#src/services/genshinAssets/materialSources/constants";
import { readMaterialSourceItemIdMap } from "#src/services/genshinAssets/materialSources/readMaterialSourceItemIdMap";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { readTextMap } from "#src/services/genshinText/readTextMap";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/genshinText/readExcelTable"), () => ({
  readExcelTable: vi.fn<(name: string) => never[]>(),
}));
vi.mock(import("#src/services/genshinText/readTextMap"), () => ({ readTextMap: vi.fn<() => Map<string, string>>() }));

describe(readMaterialSourceItemIdMap, () => {
  const CRAB_ANIMAL_ID = 28010101;
  const BUTTERFLY_ANIMAL_ID = 28050105;
  const CRAB_ITEM_ID = 100073;
  const BUTTERFLY_ITEM_ID = 101689;
  const CRAB_LABEL_ID = 275;
  const BUTTERFLY_LABEL_ID = 348;
  const CRAB_NAME = "Pale Red Crab";
  const BUTTERFLY_NAME = "Coral Butterfly";
  // The name text hashes the describe rows give, which the English text map keys
  const CRAB_NAME_HASH = 1;
  const BUTTERFLY_NAME_HASH = 2;
  let materialRows: { id: number; materialType: string }[] = [];

  beforeEach(() => {
    materialRows = [
      { id: CRAB_ITEM_ID, materialType: "MATERIAL_EXCHANGE" },
      { id: BUTTERFLY_ITEM_ID, materialType: "MATERIAL_CHEST" },
    ];
    vi.mocked(readExcelTable).mockImplementation((name) => {
      if (name === ENV_ANIMAL_GATHER_TABLE_NAME)
        return [
          { animalId: CRAB_ANIMAL_ID, gatherItemList: [{ count: 1, id: CRAB_ITEM_ID }] },
          { animalId: BUTTERFLY_ANIMAL_ID, gatherItemList: [{ count: 1, id: BUTTERFLY_ITEM_ID }] },
        ];
      if (name === MATERIAL_TABLE_NAME) return materialRows;
      if (name === ANIMAL_DESCRIBE_TABLE_NAME)
        return [
          { id: CRAB_ANIMAL_ID, nameTextMapHash: CRAB_NAME_HASH },
          { id: BUTTERFLY_ANIMAL_ID, nameTextMapHash: BUTTERFLY_NAME_HASH },
        ];
      return [];
    });
    vi.mocked(readTextMap).mockReturnValue(
      new Map([
        [String(BUTTERFLY_NAME_HASH), BUTTERFLY_NAME],
        [String(CRAB_NAME_HASH), CRAB_NAME],
      ]),
    );
  });

  test("a critter label joins the item its gather row gives, and stands at its point", () => {
    expect.hasAssertions();

    const labels: InteractiveMapLabel[] = [{ children: [], id: CRAB_LABEL_ID, name: CRAB_NAME }];

    expect(readMaterialSourceItemIdMap(labels).kindMap).toStrictEqual(
      new Map([[CRAB_LABEL_ID, { hasStandIn: true, itemId: CRAB_ITEM_ID }]]),
    );
  });

  test("a critter whose item is a chest stands at no point", () => {
    expect.hasAssertions();

    const labels: InteractiveMapLabel[] = [{ children: [], id: BUTTERFLY_LABEL_ID, name: BUTTERFLY_NAME }];

    expect(readMaterialSourceItemIdMap(labels).kindMap).toStrictEqual(
      new Map([[BUTTERFLY_LABEL_ID, { hasStandIn: false, itemId: BUTTERFLY_ITEM_ID }]]),
    );
  });

  test("a critter whose item the material table lacks is refused, not given a stand-in", () => {
    expect.hasAssertions();

    materialRows = [{ id: BUTTERFLY_ITEM_ID, materialType: "MATERIAL_CHEST" }];
    const labels: InteractiveMapLabel[] = [{ children: [], id: CRAB_LABEL_ID, name: CRAB_NAME }];

    expect(() => readMaterialSourceItemIdMap(labels)).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: Pale Red Crab, gives item 100073, which the material table lacks]`,
    );
  });
});
