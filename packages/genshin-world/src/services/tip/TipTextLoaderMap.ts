import { GameDataset } from "#src/models/data/GameDataset";
import { createTextLoaderMap } from "#src/services/data/createTextLoaderMap";

// The tip popup's title and subtitle by text id, in each language, as `pnpm -C scripts genshin:assets tips` writes
// Them. Each is fetched by its key, so a page downloads only the language it shows
export const TipTextLoaderMap = createTextLoaderMap(GameDataset.TipText);
