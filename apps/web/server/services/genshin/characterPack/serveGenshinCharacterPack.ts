import { CHARACTER_ID_REGEX } from "#server/services/genshin/characterPack/constants";
import { listCharacterPackFiles } from "#server/services/genshin/characterPack/listCharacterPackFiles";
import { listCharacterPackIds } from "#server/services/genshin/characterPack/listCharacterPackIds";
import { readCharacterPackModelPath } from "#server/services/genshin/characterPack/readCharacterPackModelPath";
import {
  CHARACTER_MODEL_PATH,
  CHARACTER_PACK_INDEX_PATH,
  CHARACTER_TERMS_PATH,
  chooseCharacterTermsFile,
  decodeCharacterTerms,
  resolveCharacterPackTextures,
} from "genshin-world";
import { contentType } from "mime-types";
import { statSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";

// A body served as the type its name's extension gives, as bytes where it gives none
const createResponse = (body: BodyInit, name: string): Response =>
  new Response(body, { headers: { "Content-Type": contentType(extname(name)) || "application/octet-stream" } });

// A file of the developer's own packs by its path below the packs' base URL, laid out as the world reads any host: the
// Index of the characters' folders, a character's model as model.pmx, its terms decoded to UTF-8 as terms.txt, or a
// Texture at the path its model names it by, found as MMD finds one. Only a folder named by a character's id is read,
// And a file is only ever one of its folder's own, so no path reaches outside the packs' directory
export const serveGenshinCharacterPack = async (
  encodedPath: string,
  directory: string,
  gameDataBaseUrl: string,
): Promise<Response> => {
  const [folderName = "", ...pathParts] = encodedPath.split("/").map((part) => decodeURIComponent(part));
  if (folderName === CHARACTER_PACK_INDEX_PATH && pathParts.length === 0)
    return Response.json(await listCharacterPackIds(directory));
  const folder = join(directory, folderName);
  if (!CHARACTER_ID_REGEX.test(folderName) || !statSync(folder, { throwIfNoEntry: false })?.isDirectory())
    return new Response(null, { status: 404 });
  const filePaths = await listCharacterPackFiles(folder);
  const path = pathParts.join("/");
  if (path === CHARACTER_TERMS_PATH) {
    const termsFilePath = chooseCharacterTermsFile(folder, filePaths);
    return createResponse(decodeCharacterTerms(await readFile(join(folder, termsFilePath))).text, CHARACTER_TERMS_PATH);
  }
  const modelPath = await readCharacterPackModelPath(folder, filePaths, Number(folderName), gameDataBaseUrl);
  if (path === CHARACTER_MODEL_PATH)
    return createResponse(await readFile(join(folder, modelPath)), CHARACTER_MODEL_PATH);
  // Every path a model names is relative to the model's own folder
  const modelFolder = modelPath.slice(0, modelPath.lastIndexOf("/") + 1);
  const [texture] = resolveCharacterPackTextures(
    [path],
    filePaths
      .filter((filePath) => filePath.startsWith(modelFolder))
      .map((filePath) => filePath.slice(modelFolder.length)),
  ).files;
  return texture === undefined
    ? new Response(null, { status: 404 })
    : createResponse(await readFile(join(folder, modelFolder, texture.filePath)), texture.filePath);
};
