import { TitleLogo } from "#src/models/splash/TitleLogo";
import { GameLanguage } from "genshin-text";

// The title logo each language's client shows: its own for the four that have one, the English one for the rest
export const GameLanguageTitleLogoMap: Record<GameLanguage, TitleLogo> = {
  [GameLanguage.ChineseSimplified]: TitleLogo.ChineseSimplified,
  [GameLanguage.ChineseTraditional]: TitleLogo.ChineseTraditional,
  [GameLanguage.English]: TitleLogo.English,
  [GameLanguage.French]: TitleLogo.English,
  [GameLanguage.German]: TitleLogo.English,
  [GameLanguage.Indonesian]: TitleLogo.English,
  [GameLanguage.Italian]: TitleLogo.English,
  [GameLanguage.Japanese]: TitleLogo.Japanese,
  [GameLanguage.Korean]: TitleLogo.Korean,
  [GameLanguage.Portuguese]: TitleLogo.English,
  [GameLanguage.Russian]: TitleLogo.English,
  [GameLanguage.Spanish]: TitleLogo.English,
  [GameLanguage.Thai]: TitleLogo.English,
  [GameLanguage.Turkish]: TitleLogo.English,
  [GameLanguage.Vietnamese]: TitleLogo.English,
};
