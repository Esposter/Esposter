import { EMPTY_WALLET } from "#src/services/inventory/constants";
import { ENGLISH_GAME_TEXT } from "genshin-text";

// The map on M over the English PC client's Sea of Clouds, where Jueyun Karst lies: the player's pointer at the centre
// Of the region's drawn outline, no landmarks read yet, scored against the wiki's full-screen 1080p screenshot of it
export const props = {
  camera: { x: -2390, yaw: 0, z: -1560 },
  explorationAreas: [],
  gameText: ENGLISH_GAME_TEXT,
  landmarks: [],
  wallet: EMPTY_WALLET,
};
