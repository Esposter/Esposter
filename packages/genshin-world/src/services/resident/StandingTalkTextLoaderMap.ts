import { GameDataset } from "#src/models/data/GameDataset";
import { createTextLoaderMap } from "#src/services/data/createTextLoaderMap";

// The residents' standing talks' words in each language, as `pnpm -C scripts genshin:text standing-talks` writes them.
// Each is fetched by its key, so a page downloads only the language it shows
export const StandingTalkTextLoaderMap = createTextLoaderMap(GameDataset.StandingTalkText);
