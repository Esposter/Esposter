import type { TextChunk } from "#src/models/data/TextChunk";

import { textChunkSchema } from "#src/models/data/TextChunk";
import { readGameData } from "#src/services/data/readGameData";
import { GameLanguage } from "genshin-text";

// The tip popup's title and subtitle by text id, in each language, as `pnpm -C scripts genshin:assets tips` writes them. Each
// Is fetched by its key, so a page downloads only the language it shows
export const TipTextLoaderMap: Record<GameLanguage, (gameDataBaseUrl: string) => Promise<TextChunk>> = {
  [GameLanguage.ChineseSimplified]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "tipText/ChineseSimplified", textChunkSchema),
  [GameLanguage.ChineseTraditional]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "tipText/ChineseTraditional", textChunkSchema),
  [GameLanguage.English]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "tipText/English", textChunkSchema),
  [GameLanguage.French]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "tipText/French", textChunkSchema),
  [GameLanguage.German]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "tipText/German", textChunkSchema),
  [GameLanguage.Indonesian]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "tipText/Indonesian", textChunkSchema),
  [GameLanguage.Italian]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "tipText/Italian", textChunkSchema),
  [GameLanguage.Japanese]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "tipText/Japanese", textChunkSchema),
  [GameLanguage.Korean]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "tipText/Korean", textChunkSchema),
  [GameLanguage.Portuguese]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "tipText/Portuguese", textChunkSchema),
  [GameLanguage.Russian]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "tipText/Russian", textChunkSchema),
  [GameLanguage.Spanish]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "tipText/Spanish", textChunkSchema),
  [GameLanguage.Thai]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "tipText/Thai", textChunkSchema),
  [GameLanguage.Turkish]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "tipText/Turkish", textChunkSchema),
  [GameLanguage.Vietnamese]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "tipText/Vietnamese", textChunkSchema),
};
