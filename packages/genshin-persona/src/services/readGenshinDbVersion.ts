import { createRequire } from "node:module";

// The installed data package's own version, read off its manifest rather than its index: the manifest costs a
// Couple of milliseconds and the index costs the better part of a second, and the version is the whole key of the
// Roster cache that exists to avoid paying for that index
export const readGenshinDbVersion = (): string => {
  const requireModule = createRequire(import.meta.url);
  const { version } = requireModule("genshin-db/package.json") as { version: string };
  return version;
};
