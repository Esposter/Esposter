import { UI_MANIFEST_EXTENSION } from "#src/services/genshinAssets/ui/constants";
import { getUiBlockPath } from "#src/services/genshinAssets/ui/getUiBlockPath";

// The JSON file a block's manifest entry is written to, beside its UI index
export const getUiManifestPath = (block: string): string => getUiBlockPath(block, UI_MANIFEST_EXTENSION);
