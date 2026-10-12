import type { AvatarManifest } from "#src/models/avatar/AvatarManifest";
import type { CharacterAvatar } from "#src/models/avatar/CharacterAvatar";
import type { CharacterMaterialOptions } from "genshin-engine";
import type { Texture } from "three";

import { createAvatarTexture } from "#src/services/character/avatar/createAvatarTexture";
import {
  AVATAR_COLOUR_TEXTURE_SLOT,
  AVATAR_TEXTURE_FOLDER,
  AVATAR_TEXTURE_SLOTS,
} from "#src/services/character/avatar/constants";
import { createCharacterAvatar } from "#src/services/character/avatar/createCharacterAvatar";
import { DATA_FETCH_TIMEOUT_MS } from "#src/services/constants";
import { AVATAR_BINARY_FILE_NAME, AVATAR_MANIFEST_FILE_NAME } from "#src/services/scene/constants";
import { fetchJson } from "#src/services/shared/fetchJson";
import { InvalidOperationError, Operation } from "@esposter/shared";

// One file of a component as the host serves it, rejected when its fetch fails or does not answer in time
const fetchFile = async (url: string): Promise<Response> => {
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
    (await fetchFile(`${componentUrl}/${AVATAR_BINARY_FILE_NAME}`)).arrayBuffer();
  const [manifest, buffer] = await Promise.all([
    fetchJson(`${componentUrl}/${AVATAR_MANIFEST_FILE_NAME}`) as Promise<AvatarManifest>,
    readBinary(),
  ]);
  const drawnMaterials = new Set(manifest.meshes.flatMap(({ submeshes }) => submeshes.map(({ material }) => material)));
  const textureFiles = [...drawnMaterials].flatMap((materialName) => {
    const textures = manifest.materials[materialName]?.textures ?? {};
    return AVATAR_TEXTURE_SLOTS.map((slot) => textures[slot]).filter((file) => file !== undefined);
  });
  const colourFiles = new Set(
    [...drawnMaterials].map((materialName) => manifest.materials[materialName]?.textures[AVATAR_COLOUR_TEXTURE_SLOT]),
  );
  const textureFileEntries = await Promise.all(
    Array.from(new Set(textureFiles), async (file): Promise<[string, Texture]> => {
      const blob = await (await fetchFile(`${componentUrl}/${AVATAR_TEXTURE_FOLDER}/${file}`)).blob();
      return [file, await createAvatarTexture(blob, colourFiles.has(file))];
    }),
  );
  return createCharacterAvatar(manifest, buffer, new Map(textureFileEntries), options);
};
