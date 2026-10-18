import { createTextLoaderMap } from "#src/services/data/createTextLoaderMap";

// The card game's names and descriptions by text id, in each language, as `pnpm -C scripts genshin:text gcg` writes
// Them. Each is fetched by its key, so a duel downloads only the language it shows
export const GcgTextLoaderMap = createTextLoaderMap("gcgText");
