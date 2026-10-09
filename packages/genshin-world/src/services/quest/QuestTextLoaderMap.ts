import type { TextChunk } from "#src/models/data/TextChunk";

import { textChunkSchema } from "#src/models/data/TextChunk";
import { readGameData } from "#src/services/data/readGameData";
import { GameLanguage } from "genshin-text";

// The carried quests' words in each language, as `pnpm -C scripts genshin:text quests` writes them.
// Each is fetched by its key, so a page downloads only the language it shows
export const QuestTextLoaderMap: Record<GameLanguage, (gameDataBaseUrl: string) => Promise<TextChunk>> = {
  [GameLanguage.ChineseSimplified]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "questText/ChineseSimplified", textChunkSchema),
  [GameLanguage.ChineseTraditional]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "questText/ChineseTraditional", textChunkSchema),
  [GameLanguage.English]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "questText/English", textChunkSchema),
  [GameLanguage.French]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "questText/French", textChunkSchema),
  [GameLanguage.German]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "questText/German", textChunkSchema),
  [GameLanguage.Indonesian]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "questText/Indonesian", textChunkSchema),
  [GameLanguage.Italian]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "questText/Italian", textChunkSchema),
  [GameLanguage.Japanese]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "questText/Japanese", textChunkSchema),
  [GameLanguage.Korean]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "questText/Korean", textChunkSchema),
  [GameLanguage.Portuguese]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "questText/Portuguese", textChunkSchema),
  [GameLanguage.Russian]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "questText/Russian", textChunkSchema),
  [GameLanguage.Spanish]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "questText/Spanish", textChunkSchema),
  [GameLanguage.Thai]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "questText/Thai", textChunkSchema),
  [GameLanguage.Turkish]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "questText/Turkish", textChunkSchema),
  [GameLanguage.Vietnamese]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "questText/Vietnamese", textChunkSchema),
};
