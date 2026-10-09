import type { TextChunk } from "#src/models/data/TextChunk";

import { textChunkSchema } from "#src/models/data/TextChunk";
import { readGameData } from "#src/services/data/readGameData";
import { GameLanguage } from "genshin-text";

// The Archive's entry names by text id, in each language, as `pnpm -C scripts genshin:assets archive` writes them. Each is
// Fetched by its key, so a page downloads only the language it shows
export const ArchiveTextLoaderMap: Record<GameLanguage, (gameDataBaseUrl: string) => Promise<TextChunk>> = {
  [GameLanguage.ChineseSimplified]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "archiveText/ChineseSimplified", textChunkSchema),
  [GameLanguage.ChineseTraditional]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "archiveText/ChineseTraditional", textChunkSchema),
  [GameLanguage.English]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "archiveText/English", textChunkSchema),
  [GameLanguage.French]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "archiveText/French", textChunkSchema),
  [GameLanguage.German]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "archiveText/German", textChunkSchema),
  [GameLanguage.Indonesian]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "archiveText/Indonesian", textChunkSchema),
  [GameLanguage.Italian]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "archiveText/Italian", textChunkSchema),
  [GameLanguage.Japanese]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "archiveText/Japanese", textChunkSchema),
  [GameLanguage.Korean]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "archiveText/Korean", textChunkSchema),
  [GameLanguage.Portuguese]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "archiveText/Portuguese", textChunkSchema),
  [GameLanguage.Russian]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "archiveText/Russian", textChunkSchema),
  [GameLanguage.Spanish]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "archiveText/Spanish", textChunkSchema),
  [GameLanguage.Thai]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "archiveText/Thai", textChunkSchema),
  [GameLanguage.Turkish]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "archiveText/Turkish", textChunkSchema),
  [GameLanguage.Vietnamese]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "archiveText/Vietnamese", textChunkSchema),
};
