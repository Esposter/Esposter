import type { ConfigWidgetFile } from "#src/models/genshinAssets/gadgets/ConfigWidgetFile";
import type { GatherRow } from "#src/models/genshinAssets/gathering/GatherRow";

import { CONFIG_WIDGET_PATH, SERENITEA_POT_ITEM_ID } from "#src/services/genshinAssets/gadgets/constants";
import { toGadgetRows } from "#src/services/genshinAssets/gadgets/toGadgetRows";
import { toSereniteaPotGadgetRow } from "#src/services/genshinAssets/gadgets/toSereniteaPotGadgetRow";
import { GATHER_TABLE_NAME } from "#src/services/genshinAssets/gathering/constants";
import { MATERIAL_TABLE_NAME } from "#src/services/genshinText/constants";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { GameDataset } from "genshin-world";
import { readFileSync } from "node:fs";

// The gadgets of the widget config, one row each by its id, and the Serenitea Pot's row built from its material row,
// Published as one record of the gadgets dataset. Each gather point type is read from the gather table as the item it gives
export const buildGadgetRows = (): Record<string, unknown> => {
  const { widgets } = parseMachineJson<ConfigWidgetFile>(readFileSync(CONFIG_WIDGET_PATH, "utf8"));
  const pointTypeItemIdMap = new Map(
    readExcelTable<GatherRow>(GATHER_TABLE_NAME).map(({ itemId, pointType }) => [pointType, itemId]),
  );
  const potRow = toSereniteaPotGadgetRow(
    readExcelTable<{ id: number; materialType: string }>(MATERIAL_TABLE_NAME),
    SERENITEA_POT_ITEM_ID,
  );
  return {
    [`${GameDataset.Gadgets}/gadgets`]: [...toGadgetRows(widgets, pointTypeItemIdMap), potRow].toSorted(
      (firstGadget, secondGadget) => firstGadget.id - secondGadget.id,
    ),
  };
};
