import { UI_INDEX_DIRECTORY, UI_INDEX_EXTENSION } from "#src/services/genshinAssets/ui/constants";
import { toUiBlockFileName } from "#src/services/genshinAssets/ui/toUiBlockFileName";
import { join } from "node:path";

// The JSON lines file a block's UI index is written to
export const getUiIndexPath = (block: string): string =>
  join(UI_INDEX_DIRECTORY, `${toUiBlockFileName(block)}${UI_INDEX_EXTENSION}`);
