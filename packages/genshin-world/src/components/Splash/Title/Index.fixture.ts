import { ENGLISH_GAME_TEXT, GameLanguage } from "genshin-text";

// The English logo, and each of the four the game draws for a client language of its own, Simplified Chinese's with
// Mainland China's licence under it
export const props = { gameText: ENGLISH_GAME_TEXT, language: GameLanguage.English };
export const variants = {
  chineseSimplified: { language: GameLanguage.ChineseSimplified },
  chineseTraditional: { language: GameLanguage.ChineseTraditional },
  japanese: { language: GameLanguage.Japanese },
  korean: { language: GameLanguage.Korean },
};
