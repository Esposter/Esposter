import type { UiIndexManifestEntry } from "#src/models/genshinAssets/ui/UiIndexManifestEntry";

import { UI_INDEX_DIRECTORY } from "#src/services/genshinAssets/ui/constants";
import { getUiManifestPath } from "#src/services/genshinAssets/ui/getUiManifestPath";
import { mkdir, writeFile } from "node:fs/promises";

// A block's manifest entry written whole, under the index's folder, which is made where it is missing.
// Each block has a file of its own, so two blocks indexed at once never write over each other's entries
export const writeUiBlockManifest = async (block: string, entry: UiIndexManifestEntry): Promise<void> => {
  await mkdir(UI_INDEX_DIRECTORY, { recursive: true });
  await writeFile(getUiManifestPath(block), JSON.stringify(entry), "utf8");
};
