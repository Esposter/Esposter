import type { KitOverlay } from "#src/models/genshinAssets/kits/KitOverlay";

import { kitOverlaySchema } from "#src/models/genshinAssets/kits/KitOverlay";
import { KIT_OVERLAY_DIRECTORY } from "#src/services/genshinAssets/kits/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

// A character's committed overlay by its name, empty where the character has none
export const readKitOverlay = (overlayName: string): KitOverlay => {
  const path = join(KIT_OVERLAY_DIRECTORY, `${overlayName}.json`);
  return existsSync(path) ? kitOverlaySchema.parse(parseMachineJson(readFileSync(path, "utf8"))) : {};
};
