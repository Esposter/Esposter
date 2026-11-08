import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";

import {
  GCSIM_CHARACTERS_PATH,
  GCSIM_CONFIG_FILE,
  GCSIM_FETCH_CONCURRENCY,
  GCSIM_MAIN_COMMIT,
  GCSIM_RAW_URL,
  GCSIM_TREES_URL,
} from "#src/services/genshinAssets/kits/constants";
import { GcsimFolderSubfoldersMap } from "#src/services/genshinAssets/kits/gcsim/GcsimFolderSubfoldersMap";
import { readGcsimCharacter } from "#src/services/genshinAssets/kits/gcsim/readGcsimCharacter";
import { fetchGitHubTree } from "#src/services/shared/fetchGitHubTree";
import { fetchOk } from "#src/services/shared/fetchOk";
import { forEachConcurrently } from "#src/services/shared/forEachConcurrently";
import { posix } from "node:path";

// The named character folders gcsim's main branch holds at its pinned commit, each with the subfolders its files sit in,
// Read only to classify a value a kit holds that the tag does not: the tree is listed through the API and each file read
// Through its raw URL into memory, never written anywhere
export const readGcsimMainCharacters = async (folders: readonly string[]): Promise<Map<string, GcsimCharacter>> => {
  const tree = await fetchGitHubTree(`${GCSIM_TREES_URL}/${GCSIM_MAIN_COMMIT}?recursive=1`, GCSIM_MAIN_COMMIT);
  const subfolderPaths = new Set(
    folders.flatMap((folder) =>
      (GcsimFolderSubfoldersMap[folder] ?? [""]).map((subfolder) =>
        posix.join(GCSIM_CHARACTERS_PATH, folder, subfolder),
      ),
    ),
  );
  const filePaths = tree
    .filter(({ path, type }) => {
      const name = posix.basename(path);
      return (
        type === "blob" &&
        subfolderPaths.has(posix.dirname(path)) &&
        (name.endsWith(".go") || name === GCSIM_CONFIG_FILE)
      );
    })
    .map(({ path }) => path);
  const sourceMap = new Map<string, string>();
  await forEachConcurrently(filePaths, GCSIM_FETCH_CONCURRENCY, async (path) => {
    const response = await fetchOk(`${GCSIM_RAW_URL}/${GCSIM_MAIN_COMMIT}/${path}`);
    sourceMap.set(path, await response.text());
  });
  return new Map(
    folders.flatMap((folder) => {
      const prefix = `${GCSIM_CHARACTERS_PATH}/${folder}/`;
      const fileMap = new Map(
        [...sourceMap]
          .filter(([path]) => path.startsWith(prefix))
          .map(([path, source]) => [path.slice(prefix.length), source]),
      );
      return fileMap.size === 0 ? [] : [[folder, readGcsimCharacter(folder, fileMap)] as const];
    }),
  );
};
