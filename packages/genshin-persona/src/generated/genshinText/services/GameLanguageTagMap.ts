// Copied from `genshin-text` by `pnpm -C scripts genshin:text write`, never edited by hand
import { GameLanguage } from "#src/generated/genshinText/models/GameLanguage";

// The BCP-47 tag of each language, which the game does not carry and `Intl` needs — to name a language, to format
// A date in it, and to match a reader's own locale to it
export const GameLanguageTagMap: Record<GameLanguage, string> = {
  [GameLanguage.ChineseSimplified]: "zh-Hans",
  [GameLanguage.ChineseTraditional]: "zh-Hant",
  [GameLanguage.English]: "en",
  [GameLanguage.French]: "fr",
  [GameLanguage.German]: "de",
  [GameLanguage.Indonesian]: "id",
  [GameLanguage.Italian]: "it",
  [GameLanguage.Japanese]: "ja",
  [GameLanguage.Korean]: "ko",
  [GameLanguage.Portuguese]: "pt",
  [GameLanguage.Russian]: "ru",
  [GameLanguage.Spanish]: "es",
  [GameLanguage.Thai]: "th",
  [GameLanguage.Turkish]: "tr",
  [GameLanguage.Vietnamese]: "vi",
};
