import type { KitOverlay } from "#src/models/shared/KitOverlay";

import { kitOverlaySchema } from "#src/models/shared/KitOverlay";
import { KIT_OVERLAY_DIRECTORY } from "#src/services/genshinAssets/kits/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

// A character's committed overlay as its file holds it, its range keys unexpanded, empty where the character has none
export const readKitOverlayFile = (overlayName: string): KitOverlay => {
  const path = join(KIT_OVERLAY_DIRECTORY, `${overlayName}.json`);
  return existsSync(path) ? kitOverlaySchema.parse(parseMachineJson(readFileSync(path, "utf8"))) : {};
};
