import type { UiIndexManifestEntry } from "#src/models/genshinAssets/ui/UiIndexManifestEntry";

import { UI_INDEX_MANIFEST_PATH } from "#src/services/genshinAssets/ui/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";

// The manifest of every indexed block by its path, or none before the first index is written
export const readUiManifest = async (): Promise<Record<string, UiIndexManifestEntry>> =>
  existsSync(UI_INDEX_MANIFEST_PATH)
    ? parseMachineJson<Record<string, UiIndexManifestEntry>>(await readFile(UI_INDEX_MANIFEST_PATH, "utf8"))
    : {};
