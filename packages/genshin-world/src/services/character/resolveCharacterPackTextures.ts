import type { CharacterPackTextures } from "#src/models/character/CharacterPackTextures";

import { getCharacterPackFilePath } from "#src/services/character/getCharacterPackFilePath";

// A path as it is matched, case-insensitively as MMD reads one, in either Unicode form a folder may spell it in
const getMatchKey = (path: string): string => path.normalize("NFC").toLowerCase();

// The textures a model names, matched to the files below the model's own folder, since every path a model names is
// Relative to it, `filePaths` and `modelPath` both relative to the release's folder: each is found under the model's own
// Spelling, which the world requests, since a folder's names may differ from it in case or Unicode form. A path
// Climbing out of the model's folder matches nothing, since a pack is read from that folder down
export const resolveCharacterPackTextures = (
  texturePaths: readonly string[],
  filePaths: readonly string[],
  modelPath: string,
): CharacterPackTextures => {
  const modelFolder = modelPath.slice(0, modelPath.lastIndexOf("/") + 1);
  const filePathMap = new Map(
    filePaths
      .filter((filePath) => filePath.startsWith(modelFolder))
      .map((filePath) => [getMatchKey(filePath.slice(modelFolder.length)), filePath]),
  );
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
