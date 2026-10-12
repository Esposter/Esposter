import { SCENE_EXPORT_ROOT_FILE_NAMES } from "genshin-world/sceneExport";
import { statSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join } from "node:path";

// The components the developer holds exports for, by the folders holding a witness layout or an avatar, in name order:
// None while the exports' directory does not exist
export const listSceneExportComponents = async (directory: string): Promise<string[]> => {
  if (!statSync(directory, { throwIfNoEntry: false })?.isDirectory()) return [];
  return (await readdir(directory, { withFileTypes: true }))
    .filter(
      (entry) =>
        entry.isDirectory() &&
        SCENE_EXPORT_ROOT_FILE_NAMES.some((fileName) =>
          statSync(join(directory, entry.name, fileName), { throwIfNoEntry: false })?.isFile(),
        ),
    )
    .map(({ name }) => name)
    .toSorted();
};
