import { GameDataset } from "#src/models/data/GameDataset";
import { createTextLoaderMap } from "#src/services/data/createTextLoaderMap";

// The carried quests' words in each language, as `pnpm -C scripts genshin:text quests` writes them. Each is fetched by
// Its key, so a page downloads only the language it shows
export const QuestTextLoaderMap = createTextLoaderMap(GameDataset.QuestText);
