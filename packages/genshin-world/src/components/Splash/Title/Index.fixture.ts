import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { GameLanguageTitleLogoMap } from "#src/services/splash/GameLanguageTitleLogoMap";
import { readTitleLogoPath } from "#src/services/splash/readTitleLogoPath";
import { ENGLISH_GAME_TEXT, GameLanguage } from "genshin-text";

// A language's props: its client's title logo, read as the opening reads it
const getLanguageProps = async (language: GameLanguage): Promise<{ language: GameLanguage; logoPath: string }> => ({
  language,
  logoPath: await readTitleLogoPath(GAME_DATA_LOCAL_BASE_URL, GameLanguageTitleLogoMap[language]),
});

// The English logo, and each of the four the game draws for a client language of its own, Simplified Chinese's with
// Mainland China's licence under it
export const props = { gameText: ENGLISH_GAME_TEXT, ...(await getLanguageProps(GameLanguage.English)) };
export const variants = {
  chineseSimplified: await getLanguageProps(GameLanguage.ChineseSimplified),
  chineseTraditional: await getLanguageProps(GameLanguage.ChineseTraditional),
  japanese: await getLanguageProps(GameLanguage.Japanese),
  korean: await getLanguageProps(GameLanguage.Korean),
};
