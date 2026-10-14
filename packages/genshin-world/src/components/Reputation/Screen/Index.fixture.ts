import { englishNameText } from "#parity/englishNameText";
import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { readMaterialDataMap } from "#src/services/inventory/readMaterialDataMap";
import { readMondstadtReputation } from "#src/services/reputation/readMondstadtReputation";
import { ENGLISH_GAME_TEXT } from "genshin-text";

// Mondstadt's Reputation at level 3, its reward page open on level 8 as the public clip shows it at 18 seconds
export const props = {
  gameText: ENGLISH_GAME_TEXT,
  level: 8,
  materialDataMap: await readMaterialDataMap(GAME_DATA_LOCAL_BASE_URL),
  nameText: englishNameText,
  progress: { exp: 0, level: 3 },
  reputation: await readMondstadtReputation(GAME_DATA_LOCAL_BASE_URL),
};
