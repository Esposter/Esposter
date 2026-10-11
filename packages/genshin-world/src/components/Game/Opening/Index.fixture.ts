import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { LOGIN_MUSIC_RECORDING_DIRECTORY } from "#src/services/login/constants";
import { readLoginData } from "#src/services/login/readLoginData";
import { GameLanguageTitleLogoMap } from "#src/services/splash/GameLanguageTitleLogoMap";
import { readTitleLogoPath } from "#src/services/splash/readTitleLogoPath";
import { ENGLISH_GAME_TEXT, GameLanguage } from "genshin-text";

// The opening's reads made ahead of it, so the page's one fetch of each serves the opening's own at once and its first
// Splash plays from the moment it mounts rather than after a white
await Promise.all([
  readTitleLogoPath(GAME_DATA_LOCAL_BASE_URL, GameLanguageTitleLogoMap[GameLanguage.English]),
  readLoginData(GAME_DATA_LOCAL_BASE_URL),
]);

// Loading part way, so the startup screen shows its lit marks once the splashes have played
export const isMotionOnly = true;
export const props = {
  gameDataBaseUrl: GAME_DATA_LOCAL_BASE_URL,
  gameText: ENGLISH_GAME_TEXT,
  language: GameLanguage.English,
  musicRecordingBaseUrl: LOGIN_MUSIC_RECORDING_DIRECTORY,
  progress: 3 / 7,
};
