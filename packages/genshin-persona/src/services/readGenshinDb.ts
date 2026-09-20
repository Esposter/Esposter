import type * as GenshinDb from "genshin-db";

import { createRequire } from "node:module";

// Loaded through `require` rather than a static import so a missing install fails inside the script, where the
// Fallback card is, instead of at link time before anything has run
export const readGenshinDb = (): typeof GenshinDb => {
  const requireModule = createRequire(import.meta.url);
  return requireModule("genshin-db") as typeof GenshinDb;
};
