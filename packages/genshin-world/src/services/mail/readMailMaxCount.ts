import { GameDataset } from "#src/models/data/GameDataset";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// The most mails a player's mailbox holds, as the game's constant table gives it. The mailbox counts its mails against
// It, as `pnpm -C scripts genshin:assets mail` publishes it
export const readMailMaxCount = (gameDataBaseUrl: string): Promise<number> =>
  readGameData(gameDataBaseUrl, `${GameDataset.Mail}/maxCount`, z.int().positive());
