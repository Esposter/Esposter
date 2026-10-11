import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { readMondstadtReputation } from "#src/services/reputation/readMondstadtReputation";
import { ENGLISH_GAME_TEXT } from "genshin-text";

// Mondstadt's Reputation at level 3, its reward page as the public clip shows it at 18 seconds
export const props = {
  gameText: ENGLISH_GAME_TEXT,
  progress: { exp: 0, level: 3 },
  reputation: await readMondstadtReputation(GAME_DATA_LOCAL_BASE_URL),
};
