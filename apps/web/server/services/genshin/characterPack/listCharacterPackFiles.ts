import { readdir } from "node:fs/promises";
import { join, relative } from "node:path";

// Every file of a character's folder by its path in the folder, separated by slashes as a model's paths are matched
export const listCharacterPackFiles = async (folder: string): Promise<string[]> =>
  (await readdir(folder, { recursive: true, withFileTypes: true }))
    .filter((entry) => entry.isFile())
    .map((entry) => relative(folder, join(entry.parentPath, entry.name)).replaceAll("\\", "/"));
