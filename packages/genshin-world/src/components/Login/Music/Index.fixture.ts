import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { readLoginData } from "#src/services/login/readLoginData";

const { music, sounds } = await readLoginData(GAME_DATA_LOCAL_BASE_URL);

// The login's music draws nothing, so it is on the parity page only for `genshin:parity listen`, which renders it
// Offline there and scores it against the game's own sound
export const isMotionOnly = true;
export const props = {
  gameDataBaseUrl: GAME_DATA_LOCAL_BASE_URL,
  isDoorForming: false,
  isDoorOpened: false,
  music,
  sounds,
};
