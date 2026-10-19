import { GameDataset } from "#src/models/data/GameDataset";
import { createTextLoaderMap } from "#src/services/data/createTextLoaderMap";

// The achievements' and categories' titles and descriptions by text id, in each language, as
// `pnpm -C scripts genshin:assets Achievements` writes them. Each is fetched by its key, so a page downloads only the
// Language it shows
export const AchievementTextLoaderMap = createTextLoaderMap(GameDataset.AchievementText);
