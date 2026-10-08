import type { CharacterMaterialOptions, ToonNodeMaterial } from "genshin-engine";
import type { BufferGeometry, SkinnedMesh } from "three";

import { CHARACTER_MODEL_FETCH_TIMEOUT_MS, CHARACTER_MODEL_PATH } from "#src/services/character/constants";
import { readCharacterPackFile } from "#src/services/character/readCharacterPackFile";
import { getResultAsync } from "@esposter/shared";
import { createCharacterMaterial, createPmxMesh, createPmxTexture, parsePmx } from "genshin-engine";

// A character's model from its pack: the PMX read, then every texture a material draws with fetched and decoded once,
// Each material drawn on the toon ramp. A texture no material draws with, a toon ramp or a sphere map the world's own
// Light stands in for, is never fetched. A pack is drawn whole or, should any of its files fail to arrive, not at all
export const readCharacterMesh = (
  characterPackBaseUrl: string,
  characterId: string,
  { lightUniforms, rampTexture }: Pick<CharacterMaterialOptions, "lightUniforms" | "rampTexture">,
): ReturnType<typeof getResultAsync<SkinnedMesh<BufferGeometry, ToonNodeMaterial[]>>> =>
  getResultAsync(async () => {
    const modelResponse = await readCharacterPackFile(
      characterPackBaseUrl,
      characterId,
      CHARACTER_MODEL_PATH,
      CHARACTER_MODEL_FETCH_TIMEOUT_MS,
    );
    const modelBuffer = await modelResponse.arrayBuffer();
    const pmxModel = parsePmx(modelBuffer);
    const drawnTextureIndices = new Set(pmxModel.materials.map(({ textureIndex }) => textureIndex));
    const textures = await Promise.all(
      pmxModel.textures.map(async (path, textureIndex) => {
        if (!drawnTextureIndices.has(textureIndex)) return undefined;
        const textureResponse = await readCharacterPackFile(
          characterPackBaseUrl,
          characterId,
          path,
          CHARACTER_MODEL_FETCH_TIMEOUT_MS,
        );
        const textureBlob = await textureResponse.blob();
        return createPmxTexture(textureBlob);
      }),
    );
    const materials = pmxModel.materials.map((pmxMaterial) =>
      createCharacterMaterial({ lightUniforms, pmxMaterial, rampTexture, texture: textures[pmxMaterial.textureIndex] }),
    );
    return createPmxMesh(pmxModel, materials);
  });
