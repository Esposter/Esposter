import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { GameLanguageTitleLogoMap } from "#src/services/splash/GameLanguageTitleLogoMap";
import { readTitleLogoPath } from "#src/services/splash/readTitleLogoPath";
import { ENGLISH_GAME_TEXT, GameLanguage } from "genshin-text";

export const isMotionOnly = true;
export const props = {
  gameText: ENGLISH_GAME_TEXT,
  language: GameLanguage.English,
  titleLogoPath: await readTitleLogoPath(GAME_DATA_LOCAL_BASE_URL, GameLanguageTitleLogoMap[GameLanguage.English]),
};
