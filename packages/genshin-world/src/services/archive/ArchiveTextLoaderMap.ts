import { createTextLoaderMap } from "#src/services/data/createTextLoaderMap";

// The Archive's entry names by text id, in each language, as `pnpm -C scripts genshin:assets archive` writes them. Each
// Is fetched by its key, so a page downloads only the language it shows
export const ArchiveTextLoaderMap = createTextLoaderMap("archiveText");
