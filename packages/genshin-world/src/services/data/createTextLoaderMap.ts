import type { TextChunk } from "#src/models/data/TextChunk";

import { textChunkSchema } from "#src/models/data/TextChunk";
import { readGameData } from "#src/services/data/readGameData";
import { GameLanguage } from "genshin-text";

// The text datasets a loader map reads, each a prefix of its languages' keys in the game data lock
type TextPrefix =
  | "achievementText"
  | "archiveText"
  | "gcgText"
  | "nameText"
  | "questText"
  | "standingTalkText"
  | "tipText";

// A text map by language, each language's chunk fetched by its own key under the prefix, so a page downloads only the
// Language it shows
export const createTextLoaderMap = (
  prefix: TextPrefix,
): Record<GameLanguage, (gameDataBaseUrl: string) => Promise<TextChunk>> => {
  const loadLanguage = (language: GameLanguage) => (gameDataBaseUrl: string) =>
    readGameData(gameDataBaseUrl, `${prefix}/${language}`, textChunkSchema);
  return {
    [GameLanguage.ChineseSimplified]: loadLanguage(GameLanguage.ChineseSimplified),
    [GameLanguage.ChineseTraditional]: loadLanguage(GameLanguage.ChineseTraditional),
    [GameLanguage.English]: loadLanguage(GameLanguage.English),
    [GameLanguage.French]: loadLanguage(GameLanguage.French),
    [GameLanguage.German]: loadLanguage(GameLanguage.German),
    [GameLanguage.Indonesian]: loadLanguage(GameLanguage.Indonesian),
    [GameLanguage.Italian]: loadLanguage(GameLanguage.Italian),
    [GameLanguage.Japanese]: loadLanguage(GameLanguage.Japanese),
    [GameLanguage.Korean]: loadLanguage(GameLanguage.Korean),
    [GameLanguage.Portuguese]: loadLanguage(GameLanguage.Portuguese),
    [GameLanguage.Russian]: loadLanguage(GameLanguage.Russian),
    [GameLanguage.Spanish]: loadLanguage(GameLanguage.Spanish),
    [GameLanguage.Thai]: loadLanguage(GameLanguage.Thai),
    [GameLanguage.Turkish]: loadLanguage(GameLanguage.Turkish),
    [GameLanguage.Vietnamese]: loadLanguage(GameLanguage.Vietnamese),
  };
};
