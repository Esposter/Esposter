import type { CharacterPack } from "#src/models/genshinCharacters/CharacterPack";
import type { CharacterPackFile } from "#src/models/genshinCharacters/CharacterPackFile";

import { CharacterPackContentType } from "#src/models/genshinCharacters/CharacterPackContentType";
import { getGameDataHash } from "#src/services/gameData/getGameDataHash";
import { chooseCharacterTermsFile } from "#src/services/genshinCharacters/chooseCharacterTermsFile";
import { createCharacterPackManifest } from "#src/services/genshinCharacters/createCharacterPackManifest";
import { decodeCharacterTerms } from "#src/services/genshinCharacters/decodeCharacterTerms";
import { findCharacterPackModel } from "#src/services/genshinCharacters/findCharacterPackModel";
import { getCharacterPackImageType } from "#src/services/genshinCharacters/getCharacterPackImageType";
import { resolveCharacterPackTextures } from "#src/services/genshinCharacters/resolveCharacterPackTextures";
import { parsePmx } from "genshin-engine";
import { CHARACTER_MODEL_PATH, CHARACTER_TERMS_PATH } from "genshin-world";
import { getContentAddress } from "keyframe-store";
import { readdir, readFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";

const createCharacterPackFile = (
  path: string,
  body: Buffer,
  contentType: CharacterPackContentType,
  isCompressed: boolean,
): CharacterPackFile => ({ body, contentType, hash: getContentAddress(body), isCompressed, path });

// A character's pack from its folder of an extracted official release: its one model, read by the engine's own reader
// So the textures are the paths the world requests, each texture matched to its file, and the terms as UTF-8. The model
// And the terms are stored compressed, and each image as its own encoding. A missing texture or one no browser decodes
// Is noted rather than refused, and the record listing every file names where the files are stored
export const readCharacterPack = async (folder: string, characterId: number): Promise<CharacterPack> => {
  const filePaths = (await readdir(folder, { recursive: true, withFileTypes: true }))
    .filter((entry) => entry.isFile())
    .map((entry) => relative(folder, join(entry.parentPath, entry.name)).replaceAll("\\", "/"));
  const modelFilePath = findCharacterPackModel(folder, filePaths);
  const modelBody = await readFile(join(folder, modelFilePath));
  const { textures } = parsePmx(new Uint8Array(modelBody).buffer);
  // Every path the model names is relative to the model's own folder, which the pack is stored from
  const modelFolder = dirname(modelFilePath) === "." ? "" : `${dirname(modelFilePath)}/`;
  const { files: textureFiles, missingPaths } = resolveCharacterPackTextures(
    textures,
    filePaths
      .filter((filePath) => filePath.startsWith(modelFolder))
      .map((filePath) => filePath.slice(modelFolder.length)),
  );
  const termsFilePath = chooseCharacterTermsFile(folder, filePaths);
  const terms = decodeCharacterTerms(await readFile(join(folder, termsFilePath)));
  const notes = [
    `model ${modelFilePath}, terms ${termsFilePath} (${terms.encoding}), ${textureFiles.length} of ${textures.length} textures`,
    ...missingPaths.map((path) => `missing texture ${path}`),
  ];
  const files = [
    createCharacterPackFile(CHARACTER_MODEL_PATH, modelBody, CharacterPackContentType.OctetStream, true),
    createCharacterPackFile(CHARACTER_TERMS_PATH, Buffer.from(terms.text), CharacterPackContentType.Text, true),
    ...(await Promise.all(
      textureFiles.map(async ({ filePath, path }) => {
        const body = await readFile(join(folder, modelFolder, filePath));
        const contentType = getCharacterPackImageType(body);
        if (contentType === undefined) notes.push(`texture ${path} is no image a browser decodes`);
        return createCharacterPackFile(path, body, contentType ?? CharacterPackContentType.OctetStream, false);
      }),
    )),
  ];
  const manifest = createCharacterPackManifest(files);
  return { characterId, files, manifest, notes, packHash: getGameDataHash(JSON.stringify(manifest)) };
};
