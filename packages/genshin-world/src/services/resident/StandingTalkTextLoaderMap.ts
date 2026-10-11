import type { TextChunk } from "#src/models/data/TextChunk";

import { textChunkSchema } from "#src/models/data/TextChunk";
import { readGameData } from "#src/services/data/readGameData";
import { GameLanguage } from "genshin-text";

// The residents' standing talks' words in each language, as `pnpm -C scripts genshin:text standing-talks` writes them.
// Each is fetched by its key, so a page downloads only the language it shows
export const StandingTalkTextLoaderMap: Record<GameLanguage, (gameDataBaseUrl: string) => Promise<TextChunk>> = {
  [GameLanguage.ChineseSimplified]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "standingTalkText/ChineseSimplified", textChunkSchema),
  [GameLanguage.ChineseTraditional]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "standingTalkText/ChineseTraditional", textChunkSchema),
  [GameLanguage.English]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "standingTalkText/English", textChunkSchema),
  [GameLanguage.French]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "standingTalkText/French", textChunkSchema),
  [GameLanguage.German]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "standingTalkText/German", textChunkSchema),
  [GameLanguage.Indonesian]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "standingTalkText/Indonesian", textChunkSchema),
  [GameLanguage.Italian]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "standingTalkText/Italian", textChunkSchema),
  [GameLanguage.Japanese]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "standingTalkText/Japanese", textChunkSchema),
  [GameLanguage.Korean]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "standingTalkText/Korean", textChunkSchema),
  [GameLanguage.Portuguese]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "standingTalkText/Portuguese", textChunkSchema),
  [GameLanguage.Russian]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "standingTalkText/Russian", textChunkSchema),
  [GameLanguage.Spanish]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "standingTalkText/Spanish", textChunkSchema),
  [GameLanguage.Thai]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "standingTalkText/Thai", textChunkSchema),
  [GameLanguage.Turkish]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "standingTalkText/Turkish", textChunkSchema),
  [GameLanguage.Vietnamese]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "standingTalkText/Vietnamese", textChunkSchema),
};
