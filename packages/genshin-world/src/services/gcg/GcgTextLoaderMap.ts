import type { TextChunk } from "#src/models/data/TextChunk";

import { textChunkSchema } from "#src/models/data/TextChunk";
import { readGameData } from "#src/services/data/readGameData";
import { GameLanguage } from "genshin-text";

// The card game's names and descriptions by text id, in each language, as `pnpm -C scripts genshin:text gcg` writes them.
// Each is fetched by its key, so a duel downloads only the language it shows
export const GcgTextLoaderMap: Record<GameLanguage, (gameDataBaseUrl: string) => Promise<TextChunk>> = {
  [GameLanguage.ChineseSimplified]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "gcgText/ChineseSimplified", textChunkSchema),
  [GameLanguage.ChineseTraditional]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "gcgText/ChineseTraditional", textChunkSchema),
  [GameLanguage.English]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "gcgText/English", textChunkSchema),
  [GameLanguage.French]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "gcgText/French", textChunkSchema),
  [GameLanguage.German]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "gcgText/German", textChunkSchema),
  [GameLanguage.Indonesian]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "gcgText/Indonesian", textChunkSchema),
  [GameLanguage.Italian]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "gcgText/Italian", textChunkSchema),
  [GameLanguage.Japanese]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "gcgText/Japanese", textChunkSchema),
  [GameLanguage.Korean]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "gcgText/Korean", textChunkSchema),
  [GameLanguage.Portuguese]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "gcgText/Portuguese", textChunkSchema),
  [GameLanguage.Russian]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "gcgText/Russian", textChunkSchema),
  [GameLanguage.Spanish]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "gcgText/Spanish", textChunkSchema),
  [GameLanguage.Thai]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "gcgText/Thai", textChunkSchema),
  [GameLanguage.Turkish]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "gcgText/Turkish", textChunkSchema),
  [GameLanguage.Vietnamese]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "gcgText/Vietnamese", textChunkSchema),
};
