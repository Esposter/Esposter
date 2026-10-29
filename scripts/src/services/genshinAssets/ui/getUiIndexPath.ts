import { UI_INDEX_EXTENSION } from "#src/services/genshinAssets/ui/constants";
import { getUiBlockPath } from "#src/services/genshinAssets/ui/getUiBlockPath";

// The JSON lines file a block's UI index is written to
export const getUiIndexPath = (block: string): string => getUiBlockPath(block, UI_INDEX_EXTENSION);
