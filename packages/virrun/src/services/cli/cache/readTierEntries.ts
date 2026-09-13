import { existsSync, readdirSync } from "node:fs";
// The entries of a host-global cache tier, sorted for a stable listing; an absent tier reads as empty.
export const readTierEntries = (path: string): string[] => (existsSync(path) ? readdirSync(path).toSorted() : []);
