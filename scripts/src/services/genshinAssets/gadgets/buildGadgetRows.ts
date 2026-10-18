import type { ConfigWidgetFile } from "#src/models/genshinAssets/gadgets/ConfigWidgetFile";
import type { GatherRow } from "#src/models/genshinAssets/gathering/GatherRow";

import { CONFIG_WIDGET_PATH } from "#src/services/genshinAssets/gadgets/constants";
import { toGadgetRows } from "#src/services/genshinAssets/gadgets/toGadgetRows";
import { GATHER_TABLE_NAME } from "#src/services/genshinAssets/gathering/constants";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { GameDataset } from "genshin-world";
import { readFileSync } from "node:fs";

// The gadgets of the widget config, one row each by its id, published as one record of the gadgets dataset. Each gather
// Point type is read from the gather table as the item it gives
export const buildGadgetRows = (): Record<string, unknown> => {
  const { widgets } = parseMachineJson<ConfigWidgetFile>(readFileSync(CONFIG_WIDGET_PATH, "utf8"));
  const pointTypeItemIdMap = new Map(
    readExcelTable<GatherRow>(GATHER_TABLE_NAME).map(({ itemId, pointType }) => [pointType, itemId]),
  );
  return { [`${GameDataset.Gadgets}/gadgets`]: toGadgetRows(widgets, pointTypeItemIdMap) };
};
