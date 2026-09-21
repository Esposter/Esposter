import type * as GenshinDb from "genshin-db";

import { createRequire } from "node:module";

// Loaded through `require` rather than a static import so a missing install fails inside the script, where the
// Hooks' quiet exit is, instead of at link time before anything has run. The load costs the better part of a
// Second and each query after it a couple of milliseconds, which is why the roster is cached, the version is read
// Off the manifest instead, and no hook path loads it
export const readGenshinDb = (): typeof GenshinDb => {
  const requireModule = createRequire(import.meta.url);
  return requireModule("genshin-db") as typeof GenshinDb;
};
