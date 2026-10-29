import { UI_INDEX_DIRECTORY } from "#src/services/genshinAssets/ui/constants";
import { toUiBlockFileName } from "#src/services/genshinAssets/ui/toUiBlockFileName";
import { join } from "node:path";

// The file a block is written to in the UI index directory, under the given extension
export const getUiBlockPath = (block: string, extension: string): string =>
  join(UI_INDEX_DIRECTORY, `${toUiBlockFileName(block)}${extension}`);
