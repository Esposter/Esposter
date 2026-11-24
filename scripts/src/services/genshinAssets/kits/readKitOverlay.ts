import type { KitOverlay } from "#src/models/shared/KitOverlay";

import { readKitOverlayFile } from "#src/services/genshinAssets/kits/readKitOverlayFile";
import { expandKitOverlay } from "genshin-world/definitions";

// A character's committed overlay by its name, with each run of hits expanded to a key per hit
export const readKitOverlay = (overlayName: string): KitOverlay => expandKitOverlay(readKitOverlayFile(overlayName));
