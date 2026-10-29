import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { NameTextLoaderMap } from "#src/services/character/NameTextLoaderMap";
import { EMPTY_WALLET } from "#src/services/inventory/constants";
import { readMapSubareaLabels } from "#src/services/map/readMapSubareaLabels";
import { MAP_REFERENCE_ZOOM_METRES } from "#src/services/map/constants";
import { readCatalogue } from "#src/services/world/readCatalogue";
import { ENGLISH_GAME_TEXT, GameLanguage } from "genshin-text";

// The map on M over the English PC client's Jueyun Karst, the pointer where the subarea labels the reference draws stand
// Round it at the zoom the reference's slider stands at, scored against the wiki's full-screen 1080p screenshot of it
export const props = {
  camera: { facing: 0, x: -1094.6, yaw: 0, z: -2699.7 },
  catalogue: await readCatalogue(GAME_DATA_LOCAL_BASE_URL),
  explorationAreas: [],
  gameText: ENGLISH_GAME_TEXT,
  landmarks: [],
  nameText: await NameTextLoaderMap[GameLanguage.English](GAME_DATA_LOCAL_BASE_URL),
  now: Temporal.Now.instant(),
  recordedDoingIds: new Set(),
  subareaLabels: await readMapSubareaLabels(GAME_DATA_LOCAL_BASE_URL),
  wallet: EMPTY_WALLET,
  metres: MAP_REFERENCE_ZOOM_METRES,
};
