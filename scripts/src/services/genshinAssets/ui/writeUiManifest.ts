import type { UiIndexManifestEntry } from "#src/models/genshinAssets/ui/UiIndexManifestEntry";

import { UI_INDEX_DIRECTORY, UI_INDEX_MANIFEST_PATH } from "#src/services/genshinAssets/ui/constants";
import { mkdir, writeFile } from "node:fs/promises";

// The manifest written whole, under the index's folder, which is made where it is missing
export const writeUiManifest = async (manifest: Record<string, UiIndexManifestEntry>): Promise<void> => {
  await mkdir(UI_INDEX_DIRECTORY, { recursive: true });
  await writeFile(UI_INDEX_MANIFEST_PATH, JSON.stringify(manifest), "utf8");
};
