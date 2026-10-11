import type { CharacterPackReader } from "#src/models/character/CharacterPackReader";
import type { CharacterMaterialOptions, ToonNodeMaterial } from "genshin-engine";
import type { BufferGeometry, SkinnedMesh } from "three";

import { CHARACTER_MODEL_PATH } from "#src/services/character/constants";
import { getResultAsync, InvalidOperationError, Operation } from "@esposter/shared";
import { createCharacterMaterial, createPmxMesh, createPmxTexture, parsePmx } from "genshin-engine";

// A character's model from its pack: the PMX read, then every texture a material draws with read and decoded once,
// Each material drawn on the toon ramp. A texture no material draws with, a toon ramp or a sphere map the world's own
// Light stands in for, is never read. A texture the pack does not hold draws its material untextured, logged once for the
// Model, and a file the pack lists that fails to arrive rejects, so the model is drawn whole or not at all
export const readCharacterMesh = (
  characterPackReader: CharacterPackReader,
  { lightUniforms, rampTexture }: Pick<CharacterMaterialOptions, "lightUniforms" | "rampTexture">,
): ReturnType<typeof getResultAsync<SkinnedMesh<BufferGeometry, ToonNodeMaterial[]>>> =>
  getResultAsync(async () => {
    const modelBlob = await characterPackReader.readFile(CHARACTER_MODEL_PATH);
    if (modelBlob === undefined)
      throw new InvalidOperationError(Operation.Read, CHARACTER_MODEL_PATH, "is no file of the pack");
    const pmxModel = parsePmx(await modelBlob.arrayBuffer());
    const drawnTextureIndices = new Set(pmxModel.materials.map(({ textureIndex }) => textureIndex));
    const missingTexturePaths: string[] = [];
    const textures = await Promise.all(
      pmxModel.textures.map(async (path, textureIndex) => {
        if (!drawnTextureIndices.has(textureIndex)) return undefined;
        const textureBlob = await characterPackReader.readFile(path);
        if (textureBlob === undefined) {
          missingTexturePaths.push(path);
          return undefined;
        }
        return createPmxTexture(textureBlob);
      }),
    );
    if (missingTexturePaths.length > 0)
      console.warn(`The model draws untextured the textures its release lacks: ${missingTexturePaths.join(", ")}`);
    const materials = pmxModel.materials.map((pmxMaterial) =>
      createCharacterMaterial({ lightUniforms, pmxMaterial, rampTexture, texture: textures[pmxMaterial.textureIndex] }),
    );
    return createPmxMesh(pmxModel, materials);
  });
