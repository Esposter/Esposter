import type { CharacterPackReader } from "#src/models/character/CharacterPackReader";
import type { CharacterMaterialOptions, ToonNodeMaterial } from "genshin-engine";
import type { BufferGeometry, SkinnedMesh } from "three";

import { CHARACTER_MODEL_PATH } from "#src/services/character/constants";
import { getResultAsync } from "@esposter/shared";
import { createCharacterMaterial, createPmxMesh, createPmxTexture, parsePmx } from "genshin-engine";

// A character's model from its pack: the PMX read, then every texture a material draws with read and decoded once,
// Each material drawn on the toon ramp. A texture no material draws with, a toon ramp or a sphere map the world's own
// Light stands in for, is never read. A pack is drawn whole or, should any of its files fail to arrive, not at all
export const readCharacterMesh = (
  characterPackReader: CharacterPackReader,
  { lightUniforms, rampTexture }: Pick<CharacterMaterialOptions, "lightUniforms" | "rampTexture">,
): ReturnType<typeof getResultAsync<SkinnedMesh<BufferGeometry, ToonNodeMaterial[]>>> =>
  getResultAsync(async () => {
    const modelBlob = await characterPackReader.readFile(CHARACTER_MODEL_PATH);
    const pmxModel = parsePmx(await modelBlob.arrayBuffer());
    const drawnTextureIndices = new Set(pmxModel.materials.map(({ textureIndex }) => textureIndex));
    const textures = await Promise.all(
      pmxModel.textures.map(async (path, textureIndex) => {
        if (!drawnTextureIndices.has(textureIndex)) return undefined;
        const textureBlob = await characterPackReader.readFile(path);
        return createPmxTexture(textureBlob);
      }),
    );
    const materials = pmxModel.materials.map((pmxMaterial) =>
      createCharacterMaterial({ lightUniforms, pmxMaterial, rampTexture, texture: textures[pmxMaterial.textureIndex] }),
    );
    return createPmxMesh(pmxModel, materials);
  });
