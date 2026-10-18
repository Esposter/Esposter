import type { TextChunk } from "#src/models/data/TextChunk";
import type { GameLanguage } from "genshin-text";

import { GameDataset } from "#src/models/data/GameDataset";
import { textChunkSchema } from "#src/models/data/TextChunk";
import { readGameData } from "#src/services/data/readGameData";

// The mails' titles, senders and bodies by text id in one language, as `pnpm -C scripts genshinAssets mail` publishes
// Them. Only the language the mailbox shows is fetched
export const readMailText = (gameDataBaseUrl: string, language: GameLanguage): Promise<TextChunk> =>
  readGameData(gameDataBaseUrl, `${GameDataset.MailText}/${language}`, textChunkSchema);
