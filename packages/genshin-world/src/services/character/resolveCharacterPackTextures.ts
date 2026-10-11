import type { CharacterPackTextures } from "#src/models/character/CharacterPackTextures";

import { getCharacterPackFilePath } from "#src/services/character/getCharacterPackFilePath";

// A path as it is matched, case-insensitively as MMD reads one, in either Unicode form a folder may spell it in
const getMatchKey = (path: string): string => path.normalize("NFC").toLowerCase();

// The textures a model names, matched to the files of its own folder, `filePaths` relative to it: each is found under
// The model's own spelling, which the world requests, since a folder's names may differ from it in case or Unicode
// Form. A path climbing out of the model's folder matches nothing, since a pack is read from that folder down
export const resolveCharacterPackTextures = (
  texturePaths: readonly string[],
  filePaths: readonly string[],
): CharacterPackTextures => {
  const filePathMap = new Map(filePaths.map((filePath) => [getMatchKey(filePath), filePath]));
  const pathFilePathMap = new Map<string, string>();
  const missingPaths: string[] = [];
  for (const texturePath of texturePaths) {
    const path = getCharacterPackFilePath(texturePath);
    const filePath = path.split("/").includes("..") ? undefined : filePathMap.get(getMatchKey(path));
    if (filePath === undefined) missingPaths.push(texturePath);
    else pathFilePathMap.set(path, filePath);
  }
  return { files: Array.from(pathFilePathMap, ([path, filePath]) => ({ filePath, path })), missingPaths };
};
