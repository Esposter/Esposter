import type { AvatarManifest } from "#src/models/avatar/AvatarManifest";
import type { CharacterAvatar } from "#src/models/avatar/CharacterAvatar";
import type { CharacterMaterialOptions } from "genshin-engine";
import type { Texture } from "three";

import { AVATAR_TEXTURE_FOLDER, AVATAR_TEXTURE_SLOTS } from "#src/services/character/avatar/constants";
import { createAvatarTexture } from "#src/services/character/avatar/createAvatarTexture";
import { createCharacterAvatar } from "#src/services/character/avatar/createCharacterAvatar";
import { DATA_FETCH_TIMEOUT_MS } from "#src/services/constants";
import { AVATAR_BINARY_FILE_NAME, AVATAR_MANIFEST_FILE_NAME } from "#src/services/scene/constants";
import { readJson } from "#src/services/shared/readJson";
import { InvalidOperationError, Operation } from "@esposter/shared";

// One file of a component as the host serves it, rejected when its fetch fails or does not answer in time
const readFileResponse = async (url: string): Promise<Response> => {
  const response = await fetch(url, { signal: AbortSignal.timeout(DATA_FETCH_TIMEOUT_MS) });
  if (!response.ok)
    throw new InvalidOperationError(Operation.Read, url, `HTTP ${response.status} ${response.statusText}`);
  return response;
};

// The game's model of a component the host serves: its manifest, its binary read once as an ArrayBuffer, and each texture
// The materials the model draws name, decoded once and shared by the materials that name it. A file that fails rejects the
// Whole model, so it is drawn whole or not at all
export const readCharacterAvatar = async (
  componentUrl: string,
  options: Pick<CharacterMaterialOptions, "lightUniforms" | "rampTexture">,
): Promise<CharacterAvatar> => {
  const readBinary = async (): Promise<ArrayBuffer> =>
    (await readFileResponse(`${componentUrl}/${AVATAR_BINARY_FILE_NAME}`)).arrayBuffer();
  const [manifest, buffer] = await Promise.all([
    readJson(`${componentUrl}/${AVATAR_MANIFEST_FILE_NAME}`) as Promise<AvatarManifest>,
    readBinary(),
  ]);
  const drawnMaterials = new Set(manifest.meshes.flatMap(({ submeshes }) => submeshes.map(({ material }) => material)));
  const textureFiles = new Set<string>();
  // A file is a colour where any slot holding it is a colour slot, so one texture decodes one way for every material
  const colourFiles = new Set<string>();
  for (const materialName of drawnMaterials) {
    const textures = manifest.materials[materialName]?.textures ?? {};
    for (const { isColour, slot } of AVATAR_TEXTURE_SLOTS) {
      const file = textures[slot];
      if (file === undefined) continue;
      textureFiles.add(file);
      if (isColour) colourFiles.add(file);
    }
  }
  const textureFileEntries = await Promise.all(
    Array.from(textureFiles, async (file): Promise<[string, Texture]> => {
      const blob = await (await readFileResponse(`${componentUrl}/${AVATAR_TEXTURE_FOLDER}/${file}`)).blob();
      return [file, await createAvatarTexture(blob, colourFiles.has(file))];
    }),
  );
  return createCharacterAvatar(manifest, buffer, new Map(textureFileEntries), options);
};
