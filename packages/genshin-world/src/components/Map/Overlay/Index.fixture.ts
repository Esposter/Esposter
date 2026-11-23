import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { NameTextLoaderMap } from "#src/services/character/NameTextLoaderMap";
import { EMPTY_WALLET } from "#src/services/inventory/constants";
import { computeUnlockedJumpLandmarks } from "#src/services/map/computeUnlockedJumpLandmarks";
import { MAP_REFERENCE_ZOOM_METRES } from "#src/services/map/constants";
import { readMapSubareaLabels } from "#src/services/map/readMapSubareaLabels";
import { readCatalogue } from "#src/services/world/readCatalogue";
import { readRegionLandmarks } from "#src/services/world/readRegionLandmarks";
import { ENGLISH_GAME_TEXT, GameLanguage } from "genshin-text";

// The map on M over the English PC client's Jueyun Karst, the pointer where the subarea labels the reference draws
// Stand Round it at the zoom the reference's slider stands at, scored against the wiki's full-screen 1080p screenshot
// Of it
const catalogue = await readCatalogue(GAME_DATA_LOCAL_BASE_URL);
// Every region's landmarks, read from the region data the parity page serves as the world's start reads them. The map
// Draws the unlocked ones alone, so every landmark is unlocked here and no quest is done, which holds a weekly boss's
// Entrance back as the world does
const jumpLandmarks = (
  await Promise.all(catalogue.regions.map(({ id }) => readRegionLandmarks("regions", id)))
).flatMap(({ landmarks }) => landmarks);
const landmarks = computeUnlockedJumpLandmarks(jumpLandmarks, new Set(jumpLandmarks.map(({ id }) => id)), new Set());

export const props = {
  camera: { facing: 0, x: -1094.6, yaw: 0, z: -2699.7 },
  catalogue,
  explorationAreas: [],
  gameText: ENGLISH_GAME_TEXT,
  landmarks,
  metres: MAP_REFERENCE_ZOOM_METRES,
  nameText: await NameTextLoaderMap[GameLanguage.English](GAME_DATA_LOCAL_BASE_URL),
  now: Temporal.Now.instant(),
  recordedDoingIds: new Set(),
  subareaLabels: await readMapSubareaLabels(GAME_DATA_LOCAL_BASE_URL),
  wallet: EMPTY_WALLET,
};
