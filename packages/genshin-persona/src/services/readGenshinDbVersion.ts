import { createRequire } from "node:module";

// The installed data package's own version, read off its manifest rather than its index, which `readGenshinDb`
// Says the cost of; the version is the whole key of the roster cache that exists to avoid paying for that index
export const readGenshinDbVersion = (): string => {
  const requireModule = createRequire(import.meta.url);
  const { version } = requireModule("genshin-db/package.json") as { version: string };
  return version;
};
