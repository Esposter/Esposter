import { UI_INDEX_DIRECTORY, UI_INDEX_EXTENSION } from "#src/services/genshinAssets/ui/constants";
import { existsSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join } from "node:path";

// The index of every block indexed so far, found by listing the index's folder, or none before the first index is written
export const readUiIndexPaths = async (): Promise<string[]> => {
  if (!existsSync(UI_INDEX_DIRECTORY)) return [];
  const names = await readdir(UI_INDEX_DIRECTORY);
  return names.filter((name) => name.endsWith(UI_INDEX_EXTENSION)).map((name) => join(UI_INDEX_DIRECTORY, name));
};
