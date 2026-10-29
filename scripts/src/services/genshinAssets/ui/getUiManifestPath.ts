import { UI_INDEX_DIRECTORY, UI_MANIFEST_EXTENSION } from "#src/services/genshinAssets/ui/constants";
import { toUiBlockFileName } from "#src/services/genshinAssets/ui/toUiBlockFileName";
import { join } from "node:path";

// The JSON file a block's manifest entry is written to, beside its UI index
export const getUiManifestPath = (block: string): string =>
  join(UI_INDEX_DIRECTORY, `${toUiBlockFileName(block)}${UI_MANIFEST_EXTENSION}`);
