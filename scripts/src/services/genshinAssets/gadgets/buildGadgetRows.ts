import type { ConfigWidgetFile } from "#src/models/genshinAssets/gadgets/ConfigWidgetFile";

import { CONFIG_WIDGET_PATH } from "#src/services/genshinAssets/gadgets/constants";
import { toGadgetRows } from "#src/services/genshinAssets/gadgets/toGadgetRows";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { GameDataset } from "genshin-world";
import { readFileSync } from "node:fs";

// The gadgets of the widget config, one row each by its id, published as one record of the gadgets dataset
export const buildGadgetRows = (): Record<string, unknown> => {
  const { widgets } = parseMachineJson<ConfigWidgetFile>(readFileSync(CONFIG_WIDGET_PATH, "utf8"));
  return { [`${GameDataset.Gadgets}/gadgets`]: toGadgetRows(widgets) };
};
