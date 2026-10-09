import type { CharacterPack } from "#src/models/character/CharacterPack";
import type { PickedCharacterPack } from "#src/models/character/PickedCharacterPack";

import { chooseCharacterPackModel } from "#src/services/character/chooseCharacterPackModel";
import { chooseCharacterTermsFile } from "#src/services/character/chooseCharacterTermsFile";
import { CHARACTER_MODEL_PATH, CHARACTER_TERMS_PATH } from "#src/services/character/constants";
import { decodeCharacterTerms } from "#src/services/character/decodeCharacterTerms";
import { identifyCharacterPack } from "#src/services/character/identifyCharacterPack";
import { resolveCharacterPackTextures } from "#src/services/character/resolveCharacterPackTextures";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";
import { parsePmx } from "genshin-engine";

// A release a player picked, read into the pack layout the world draws from, in the browser and by the rules a folder
// On the development server's disk is read by: the character it is of, identified by its models' or folders' names
// Among the game's, else the one it was picked for; that character's model; every texture the model names that the
// Release holds, refused where one a material draws with is missing; and its terms, decoded to text. The pack's hash is
// A SHA-256 of its files and their paths, which it is kept under
export const readPickedCharacterPack = async (
  { name, paths, readFiles }: PickedCharacterPack,
  characterIdNamesMap: ReadonlyMap<number, readonly string[]>,
  characterId: number,
): Promise<CharacterPack> => {
  const modelPaths = paths.filter((path) => path.toLowerCase().endsWith(".pmx"));
  const modelBlobs = readFiles(modelPaths);
  const pmxModels = await Promise.all(modelBlobs.map(async (modelBlob) => parsePmx(await modelBlob.arrayBuffer())));
  const folderNames = [...new Set(paths.flatMap((path) => path.split("/").slice(0, -1)))];
  const packCharacterId = identifyCharacterPack(
    pmxModels.map((pmxModel) => pmxModel.name),
    folderNames,
    characterIdNamesMap,
    characterId,
  );
  const modelPath = await chooseCharacterPackModel(
    name,
    paths,
    (path) => Promise.resolve(takeOne(pmxModels, modelPaths.indexOf(path)).name),
    () => Promise.resolve(characterIdNamesMap.get(packCharacterId) ?? []),
  );
  const modelIndex = modelPaths.indexOf(modelPath);
  const pmxModel = takeOne(pmxModels, modelIndex);
  const { files, missingPaths } = resolveCharacterPackTextures(pmxModel.textures, paths, modelPath);
  const drawnTexturePaths = new Set(
    pmxModel.materials.flatMap(({ textureIndex }) => pmxModel.textures[textureIndex] ?? []),
  );
  const missingDrawnPaths = missingPaths.filter((path) => drawnTexturePaths.has(path));
  if (missingDrawnPaths.length > 0)
    throw new InvalidOperationError(
      Operation.Read,
      modelPath,
      `draws with textures the release lacks: ${missingDrawnPaths.join(", ")}`,
    );
  const termsBlob = takeOne(readFiles([chooseCharacterTermsFile(name, paths)]));
  const terms = decodeCharacterTerms(new Uint8Array(await termsBlob.arrayBuffer())).text;
  const textureBlobs = readFiles(files.map(({ filePath }) => filePath));
  const fileMap = new Map<string, Blob>([
    [CHARACTER_MODEL_PATH, takeOne(modelBlobs, modelIndex)],
    [CHARACTER_TERMS_PATH, new Blob([terms])],
    ...files.map(({ path }, index): [string, Blob] => [path, takeOne(textureBlobs, index)]),
  ]);
  const packBlob = new Blob([...fileMap].flatMap(([path, blob]) => [path, "\0", blob]));
  const packHash = new Uint8Array(await crypto.subtle.digest("SHA-256", await packBlob.arrayBuffer())).toHex();
  return { characterId: packCharacterId, files: fileMap, modelName: pmxModel.name, packHash, terms };
};
