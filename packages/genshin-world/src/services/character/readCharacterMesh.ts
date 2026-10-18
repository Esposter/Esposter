import type { CharacterPackReader } from "#src/models/character/CharacterPackReader";
import type { CharacterMaterialOptions, ToonNodeMaterial } from "genshin-engine";
import type { BufferGeometry, SkinnedMesh } from "three";

import { CHARACTER_MODEL_PATH } from "#src/services/character/constants";
import { getCharacterMaterialTextureIndices } from "#src/services/character/getCharacterMaterialTextureIndices";
import { getResultAsync, InvalidOperationError, Operation } from "@esposter/shared";
import {
  checkTransparentTexels,
  createCharacterMaterial,
  createPmxMesh,
  createPmxTexture,
  createPmxToonTexture,
  parsePmx,
} from "genshin-engine";

// A character's model from its pack: the PMX read, then every texture a material draws with read and decoded once: its
// Texture, its sphere map and its toon ramp where the file names one in the model's list. A material's shared toon ramp
// Is the world's own, so no file of it is read. A texture the pack does not hold draws its material without it, logged
// Once for the model, and a file the pack lists that fails to arrive rejects, so the model is drawn whole or not at all
export const readCharacterMesh = (
  characterPackReader: CharacterPackReader,
  { lightUniforms, rampTexture }: Pick<CharacterMaterialOptions, "lightUniforms" | "rampTexture">,
): ReturnType<typeof getResultAsync<SkinnedMesh<BufferGeometry, ToonNodeMaterial[]>>> =>
  getResultAsync(async () => {
    const modelBlob = await characterPackReader.readFile(CHARACTER_MODEL_PATH);
    if (modelBlob === undefined)
      throw new InvalidOperationError(Operation.Read, CHARACTER_MODEL_PATH, "is no file of the pack");
    const pmxModel = parsePmx(await modelBlob.arrayBuffer());
    const drawnTextureIndices = new Set(
      pmxModel.materials.flatMap((material) => getCharacterMaterialTextureIndices(material)),
    );
    const toonTextureIndices = new Set(
      pmxModel.materials.filter(({ isToonShared }) => !isToonShared).map(({ toonIndex }) => toonIndex),
    );
    const missingTexturePaths: string[] = [];
    const textures = await Promise.all(
      pmxModel.textures.map(async (path, textureIndex) => {
        if (!drawnTextureIndices.has(textureIndex)) return undefined;
        const textureBlob = await characterPackReader.readFile(path);
        if (textureBlob === undefined) {
          missingTexturePaths.push(path);
          return undefined;
        }
        return toonTextureIndices.has(textureIndex) ? createPmxToonTexture(textureBlob) : createPmxTexture(textureBlob);
      }),
    );
    if (missingTexturePaths.length > 0)
      console.warn(`The model draws untextured the textures its release lacks: ${missingTexturePaths.join(", ")}`);
    const transparentTextureIndices = new Set(
      [...new Set(pmxModel.materials.map(({ textureIndex }) => textureIndex))].filter((textureIndex) => {
        const image = textures[textureIndex]?.image;
        return image instanceof ImageBitmap && checkTransparentTexels(image);
      }),
    );
    const materials = pmxModel.materials.map((pmxMaterial) =>
      createCharacterMaterial({
        isTextureTransparent: transparentTextureIndices.has(pmxMaterial.textureIndex),
        lightUniforms,
        pmxMaterial,
        rampTexture,
        sphereTexture: textures[pmxMaterial.sphereTextureIndex],
        texture: textures[pmxMaterial.textureIndex],
        toonTexture: pmxMaterial.isToonShared ? undefined : textures[pmxMaterial.toonIndex],
      }),
    );
    return createPmxMesh(pmxModel, materials);
  });
