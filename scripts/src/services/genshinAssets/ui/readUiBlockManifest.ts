import type { UiIndexManifestEntry } from "#src/models/genshinAssets/ui/UiIndexManifestEntry";

import { getUiManifestPath } from "#src/services/genshinAssets/ui/getUiManifestPath";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";

// A block's manifest entry, or none before the block's index is written
export const readUiBlockManifest = async (block: string): Promise<UiIndexManifestEntry | undefined> => {
  const manifestPath = getUiManifestPath(block);
  return existsSync(manifestPath)
    ? parseMachineJson<UiIndexManifestEntry>(await readFile(manifestPath, "utf8"))
    : undefined;
};
