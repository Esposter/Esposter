import { GameDataset } from "#src/models/data/GameDataset";
import { createTextLoaderMap } from "#src/services/data/createTextLoaderMap";

// The names the stat tables cite by text id, the characters' and the weapons', in each language, as
// `pnpm -C scripts genshin:text names` writes them. Each is fetched by its key, so a page downloads only the language
// It shows and none of them with the package
export const NameTextLoaderMap = createTextLoaderMap(GameDataset.NameText);
