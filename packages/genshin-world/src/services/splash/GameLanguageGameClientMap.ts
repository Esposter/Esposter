import { GameClient } from "#src/models/splash/GameClient";
import { GameLanguage } from "genshin-text";

// The build each language's reader plays: Simplified Chinese is mainland China's, every other language the global one's
export const GameLanguageGameClientMap: Record<GameLanguage, GameClient> = {
  [GameLanguage.ChineseSimplified]: GameClient.Mainland,
  [GameLanguage.ChineseTraditional]: GameClient.Global,
  [GameLanguage.English]: GameClient.Global,
  [GameLanguage.French]: GameClient.Global,
  [GameLanguage.German]: GameClient.Global,
  [GameLanguage.Indonesian]: GameClient.Global,
  [GameLanguage.Italian]: GameClient.Global,
  [GameLanguage.Japanese]: GameClient.Global,
  [GameLanguage.Korean]: GameClient.Global,
  [GameLanguage.Portuguese]: GameClient.Global,
  [GameLanguage.Russian]: GameClient.Global,
  [GameLanguage.Spanish]: GameClient.Global,
  [GameLanguage.Thai]: GameClient.Global,
  [GameLanguage.Turkish]: GameClient.Global,
  [GameLanguage.Vietnamese]: GameClient.Global,
};
