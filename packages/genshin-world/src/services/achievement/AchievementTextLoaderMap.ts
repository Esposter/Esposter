import type { TextChunk } from "#src/models/data/TextChunk";

import { textChunkSchema } from "#src/models/data/TextChunk";
import { readGameData } from "#src/services/data/readGameData";
import { GameLanguage } from "genshin-text";

// The achievements' and categories' titles and descriptions by text id, in each language, as `pnpm -C scripts genshin:assets
// Achievements` writes them. Each is fetched by its key, so a page downloads only the language it shows
export const AchievementTextLoaderMap: Record<GameLanguage, (gameDataBaseUrl: string) => Promise<TextChunk>> = {
  [GameLanguage.ChineseSimplified]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "achievementText/ChineseSimplified", textChunkSchema),
  [GameLanguage.ChineseTraditional]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "achievementText/ChineseTraditional", textChunkSchema),
  [GameLanguage.English]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "achievementText/English", textChunkSchema),
  [GameLanguage.French]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "achievementText/French", textChunkSchema),
  [GameLanguage.German]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "achievementText/German", textChunkSchema),
  [GameLanguage.Indonesian]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "achievementText/Indonesian", textChunkSchema),
  [GameLanguage.Italian]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "achievementText/Italian", textChunkSchema),
  [GameLanguage.Japanese]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "achievementText/Japanese", textChunkSchema),
  [GameLanguage.Korean]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "achievementText/Korean", textChunkSchema),
  [GameLanguage.Portuguese]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "achievementText/Portuguese", textChunkSchema),
  [GameLanguage.Russian]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "achievementText/Russian", textChunkSchema),
  [GameLanguage.Spanish]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "achievementText/Spanish", textChunkSchema),
  [GameLanguage.Thai]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "achievementText/Thai", textChunkSchema),
  [GameLanguage.Turkish]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "achievementText/Turkish", textChunkSchema),
  [GameLanguage.Vietnamese]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "achievementText/Vietnamese", textChunkSchema),
};
