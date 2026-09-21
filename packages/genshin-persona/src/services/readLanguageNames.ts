import type * as GenshinDb from "genshin-db";

import { readGenshinDb } from "#src/services/readGenshinDb";

// Every language the data package answers in, read off the package itself rather than listed here: a bump that adds
// One is a language the plugin speaks with nothing to edit, the same way a patch's new characters arrive. It loads
// The package, so only a verb a person ran calls it — never a hook
export const readLanguageNames = (): GenshinDb.Language[] => Object.values(readGenshinDb().Language);
