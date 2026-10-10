import type { HudInterfaceRects } from "#src/models/hud/HudInterfaceRects";

import { hudInterfaceRectsSchema } from "#src/models/hud/HudInterfaceRects";
import { readGameData } from "#src/services/data/readGameData";

// The HUD's pieces' rects, as `pnpm -C scripts genshin:assets fit hud` fits them from the game's interface tree,
// Fetched by its key from the hosted game data and checked against its schema as it arrives
export const readHudInterfaceRects = (gameDataBaseUrl: string): Promise<HudInterfaceRects> =>
  readGameData(gameDataBaseUrl, "hud/interfaceRects", hudInterfaceRectsSchema);
