import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";

import {
  GCSIM_CHARACTERS_PATH,
  GCSIM_CONFIG_FILE,
  GCSIM_MAIN_BRANCH,
  GCSIM_RAW_URL,
} from "#src/services/genshinAssets/kits/constants";
import { readGcsimCharacter } from "#src/services/genshinAssets/kits/gcsim/readGcsimCharacter";
import { fetchOk } from "#src/services/shared/fetchOk";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { runGh } from "#src/services/shared/runGh";

const FETCH_CONCURRENCY = 8;

// The named character folders of gcsim's current branch that it has, read only to classify a value a kit holds that the
// Tag does not: the tree is listed through the API and each file read through its raw URL into memory, never written
// Anywhere
export const readGcsimMainCharacters = async (folders: readonly string[]): Promise<Map<string, GcsimCharacter>> => {
  const { tree } = parseMachineJson<{ tree: { path: string; type: string }[] }>(
    runGh(["api", `repos/genshinsim/gcsim/git/trees/${GCSIM_MAIN_BRANCH}?recursive=1`]),
  );
  const wantedFolders = new Set(folders);
  const filePaths = tree
    .filter(({ path, type }) => {
      const [, folder, name, ...rest] = path.slice(GCSIM_CHARACTERS_PATH.length).split("/");
      return (
        type === "blob" &&
        path.startsWith(`${GCSIM_CHARACTERS_PATH}/`) &&
        folder !== undefined &&
        wantedFolders.has(folder) &&
        name !== undefined &&
        rest.length === 0 &&
        (name.endsWith(".go") || name === GCSIM_CONFIG_FILE)
      );
    })
    .map(({ path }) => path);
  const sourceMap = new Map<string, string>();
  for (let start = 0; start < filePaths.length; start += FETCH_CONCURRENCY)
    // oxlint-disable-next-line no-await-in-loop -- Bounded concurrency: each batch starts once the last settles
    await Promise.all(
      filePaths.slice(start, start + FETCH_CONCURRENCY).map(async (path) => {
        const response = await fetchOk(`${GCSIM_RAW_URL}/${GCSIM_MAIN_BRANCH}/${path}`);
        sourceMap.set(path, await response.text());
      }),
    );
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
