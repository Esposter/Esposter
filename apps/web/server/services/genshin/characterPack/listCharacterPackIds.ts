import { CHARACTER_ID_REGEX } from "#server/services/genshin/characterPack/constants";
import { statSync } from "node:fs";
import { readdir } from "node:fs/promises";

// The characters the developer holds a pack for, by their folders' names, in id order: none while the packs' directory
// Does not exist
export const listCharacterPackIds = async (directory: string): Promise<number[]> => {
  if (!statSync(directory, { throwIfNoEntry: false })?.isDirectory()) return [];
  return (await readdir(directory, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && CHARACTER_ID_REGEX.test(entry.name))
    .map(({ name }) => Number(name))
    .toSorted((firstId, secondId) => firstId - secondId);
};
