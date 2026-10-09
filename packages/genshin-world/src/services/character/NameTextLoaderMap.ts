import type { TextChunk } from "#src/models/data/TextChunk";

import { textChunkSchema } from "#src/models/data/TextChunk";
import { readGameData } from "#src/services/data/readGameData";
import { GameLanguage } from "genshin-text";

// The names the stat tables cite by text id, the characters' and the weapons', in each language, as
// `pnpm -C scripts genshin:text names` writes them. Each is fetched by its key, so a page downloads only the language it
// Shows and none of them with the package
export const NameTextLoaderMap: Record<GameLanguage, (gameDataBaseUrl: string) => Promise<TextChunk>> = {
  [GameLanguage.ChineseSimplified]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "nameText/ChineseSimplified", textChunkSchema),
  [GameLanguage.ChineseTraditional]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "nameText/ChineseTraditional", textChunkSchema),
  [GameLanguage.English]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "nameText/English", textChunkSchema),
  [GameLanguage.French]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "nameText/French", textChunkSchema),
  [GameLanguage.German]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "nameText/German", textChunkSchema),
  [GameLanguage.Indonesian]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "nameText/Indonesian", textChunkSchema),
  [GameLanguage.Italian]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "nameText/Italian", textChunkSchema),
  [GameLanguage.Japanese]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "nameText/Japanese", textChunkSchema),
  [GameLanguage.Korean]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "nameText/Korean", textChunkSchema),
  [GameLanguage.Portuguese]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "nameText/Portuguese", textChunkSchema),
  [GameLanguage.Russian]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "nameText/Russian", textChunkSchema),
  [GameLanguage.Spanish]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "nameText/Spanish", textChunkSchema),
  [GameLanguage.Thai]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "nameText/Thai", textChunkSchema),
  [GameLanguage.Turkish]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "nameText/Turkish", textChunkSchema),
  [GameLanguage.Vietnamese]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "nameText/Vietnamese", textChunkSchema),
};
