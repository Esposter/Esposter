import type { ConfigWidgetFile } from "#src/models/genshinAssets/gadgets/ConfigWidgetFile";

import {
  CONFIG_WIDGET_PATH,
  GADGET_GENERATED_DIRECTORY,
  GADGETS_PATH,
} from "#src/services/genshinAssets/gadgets/constants";
import { toGadgetRows } from "#src/services/genshinAssets/gadgets/toGadgetRows";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

// The gadgets of the widget config, one row each by its id, written as one slice in the World's generated folder
export const writeGadgetRows = (): void => {
  const { widgets } = parseMachineJson<ConfigWidgetFile>(readFileSync(CONFIG_WIDGET_PATH, "utf8"));
  mkdirSync(GADGET_GENERATED_DIRECTORY, { recursive: true });
  writeFileSync(GADGETS_PATH, `${JSON.stringify(toGadgetRows(widgets), undefined, 2)}\n`);
};
