import type { CharacterPackIndex } from "#src/models/character/CharacterPackIndex";
import type { CharacterPackReader } from "#src/models/character/CharacterPackReader";

import { chooseCharacterPackModel } from "#src/services/character/chooseCharacterPackModel";
import { chooseCharacterTermsFile } from "#src/services/character/chooseCharacterTermsFile";
import { CHARACTER_MODEL_PATH, CHARACTER_TERMS_PATH } from "#src/services/character/constants";
import { getCharacterPackCacheUrl } from "#src/services/character/getCharacterPackCacheUrl";
import { readCharacterNames } from "#src/services/character/readCharacterNames";
import { resolveCharacterPackTextures } from "#src/services/character/resolveCharacterPackTextures";
import { getResult, ID_SEPARATOR, InvalidOperationError, Operation } from "@esposter/shared";
import { parsePmx } from "genshin-engine";

// One avatar's pack read from the cache its files were downloaded into.
// The model is the one its folder's rules choose, and the terms are the terms file those rules find.
// So a pack keeps the names it was published under.
// The model is chosen by the first read that needs it, so a folder of several models reads the names it is matched by
// Only when its character is read, not as the world starts.
// Any other path is read as the model names it, beside the model's own folder.
// A path the pack does not list is none
export const createCharacterPackReader = (
  cache: Pick<Cache, "match">,
  gameDataBaseUrl: string,
  { avatarId, files }: CharacterPackIndex["avatars"][number],
): CharacterPackReader => {
  const filePaths = files.map(({ path }) => path);
  const readListedFile = async (filePath: string) => {
    const file = files.find((indexFile) => indexFile.path === filePath);
    if (file === undefined) return undefined;
    const response = await cache.match(getCharacterPackCacheUrl(gameDataBaseUrl, avatarId, file.path, file.sha256));
    return response?.blob();
  };
  const readModelName = async (filePath: string) => {
    const modelBlob = await readListedFile(filePath);
    if (modelBlob === undefined) throw new InvalidOperationError(Operation.Read, filePath, "is no file of the pack");
    return parsePmx(await modelBlob.arrayBuffer()).name;
  };
  let modelPathRequest: Promise<string> | undefined;
  const getModelPath = (): Promise<string> => {
    modelPathRequest ??= chooseCharacterPackModel(String(avatarId), filePaths, readModelName, () =>
      readCharacterNames(gameDataBaseUrl, avatarId),
    );
    return modelPathRequest;
  };
  // A pack with no terms file still draws its model, and its terms read as unloaded, so the error is logged where it is found
  const termsPath = getResult(() => chooseCharacterTermsFile(String(avatarId), filePaths)).match(
    (termsFile) => termsFile,
    (error) => {
      console.error(error);
      return undefined;
    },
  );
  return {
    characterId: avatarId,
    key: [avatarId, ...files.map(({ sha256 }) => sha256)].join(ID_SEPARATOR),
    readFile: async (path) => {
      if (path === CHARACTER_TERMS_PATH) return termsPath === undefined ? undefined : readListedFile(termsPath);
      const modelPath = await getModelPath();
      if (path === CHARACTER_MODEL_PATH) return readListedFile(modelPath);
      const [texture] = resolveCharacterPackTextures([path], filePaths, modelPath).files;
      return texture === undefined ? undefined : readListedFile(texture.filePath);
    },
  };
};
