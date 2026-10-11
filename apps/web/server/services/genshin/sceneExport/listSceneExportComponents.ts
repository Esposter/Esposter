import { WITNESS_LAYOUT_FILE_NAME } from "genshin-world/sceneExport";
import { statSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join } from "node:path";

// The components the developer holds exports for, by the folders holding a witness layout, in name order: none while
// The exports' directory does not exist
export const listSceneExportComponents = async (directory: string): Promise<string[]> => {
  if (!statSync(directory, { throwIfNoEntry: false })?.isDirectory()) return [];
  return (await readdir(directory, { withFileTypes: true }))
    .filter(
      (entry) =>
        entry.isDirectory() &&
        statSync(join(directory, entry.name, WITNESS_LAYOUT_FILE_NAME), { throwIfNoEntry: false })?.isFile(),
    )
    .map(({ name }) => name)
    .toSorted();
};
