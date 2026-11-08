import type { StaleRow } from "#src/models/gameVersion/StaleRow";

import { readStaleRows } from "#src/services/gameVersion/readStaleRows";
import { EXTRACTED_DIRECTORY, WORLD_DATA_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { CITY_AREA_FILE_PATH } from "#src/services/genshinAssets/world/constants";
import { GAME_TEXT_DIRECTORY } from "#src/services/genshinText/constants";

// The stale outputs of the installed game, found under the folders the stamp writers write into and beside the files they
// Stamp outside those folders
export const readInstallStaleRows = (gameVersion: string): Promise<StaleRow[]> =>
  readStaleRows(gameVersion, [EXTRACTED_DIRECTORY, GAME_TEXT_DIRECTORY, WORLD_DATA_DIRECTORY], [CITY_AREA_FILE_PATH]);
