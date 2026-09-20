import type { Character } from "#src/models/Character";
import type * as GenshinDb from "genshin-db";

import { createRequire } from "node:module";

// Loaded through `require` rather than a static import so a missing install fails inside the script, where the
// Fallback card is, instead of at link time before anything has run
export const readRoster = (): Character[] => {
  const requireModule = createRequire(import.meta.url);
  const genshindb = requireModule("genshin-db") as typeof GenshinDb;
  const characters = genshindb.characters("names", { matchCategories: true, verboseCategories: true });
  return characters.map(({ birthdaymmdd, elementText, name, region, title, version }) => ({
    birthday: birthdaymmdd,
    element: elementText,
    name,
    region,
    title,
    version,
  }));
};
