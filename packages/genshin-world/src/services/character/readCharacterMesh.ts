import type { CharacterPackReader } from "#src/models/character/CharacterPackReader";
import type { CharacterMaterialOptions, ToonNodeMaterial } from "genshin-engine";
import type { BufferGeometry, SkinnedMesh } from "three";

import { CHARACTER_MODEL_PATH } from "#src/services/character/constants";
import { getCharacterMaterialTextureIndices } from "#src/services/character/getCharacterMaterialTextureIndices";
import { getCharacterPmxUnitMetres } from "#src/services/character/getCharacterPmxUnitMetres";
import { getResultAsync, InvalidOperationError, Operation } from "@esposter/shared";
import {
  checkTransparentTexels,
  createCharacterMaterial,
  createPmxMesh,
  createPmxTexture,
  createPmxToonTexture,
  parsePmx,
  PmxSphereMode,
} from "genshin-engine";

// A character's model from its pack: the PMX read, then every texture a material draws with read once: its Texture, its
// Sphere map and its toon ramp where the file names one in the model's list, each decoded for each role it is drawn in,
// As a colour and as a toon ramp, since a toon is read differently. A material's shared toon ramp is the world's own, so
// No file of it is read. A texture the pack does not hold draws its material without it, logged once for the model, and
// A file the pack lists that fails to arrive rejects, so the model is drawn whole or not at all. The model stands at its
// Character's unit of metres, which its id gives
export const readCharacterMesh = (
  characterPackReader: CharacterPackReader,
  {
    characterId,
    lightUniforms,
    rampTexture,
  }: Pick<CharacterMaterialOptions, "lightUniforms" | "rampTexture"> & { characterId: number },
): ReturnType<typeof getResultAsync<SkinnedMesh<BufferGeometry, ToonNodeMaterial[]>>> =>
  getResultAsync(async () => {
    const modelBlob = await characterPackReader.readFile(CHARACTER_MODEL_PATH);
    if (modelBlob === undefined)
      throw new InvalidOperationError(Operation.Read, CHARACTER_MODEL_PATH, "is no file of the pack");
    const pmxModel = parsePmx(await modelBlob.arrayBuffer());
    const drawnTextureIndices = new Set(
      pmxModel.materials.flatMap((material) => getCharacterMaterialTextureIndices(material)),
    );
    const colourTextureIndices = new Set(
      pmxModel.materials.flatMap(({ sphereMode, sphereTextureIndex, textureIndex }) =>
        sphereMode === PmxSphereMode.Disabled ? [textureIndex] : [textureIndex, sphereTextureIndex],
      ),
    );
    const toonTextureIndices = new Set(
      pmxModel.materials.filter(({ isToonShared }) => !isToonShared).map(({ toonIndex }) => toonIndex),
    );
    const missingTexturePaths: string[] = [];
    const blobs = await Promise.all(
      pmxModel.textures.map(async (path, textureIndex) => {
        if (!drawnTextureIndices.has(textureIndex)) return undefined;
        const textureBlob = await characterPackReader.readFile(path);
        if (textureBlob === undefined) missingTexturePaths.push(path);
        return textureBlob;
      }),
    );
    if (missingTexturePaths.length > 0)
      console.warn(`The model draws untextured the textures its release lacks: ${missingTexturePaths.join(", ")}`);
    // A toon is flipped and read without sRGB, so a texture drawn both as a colour and as a toon is decoded once each way
    // Rather than shared, where the one decoded as a toon would draw its colour flipped and unconverted
    const colourTextures = await Promise.all(
      blobs.map((blob, textureIndex) =>
        blob && colourTextureIndices.has(textureIndex) ? createPmxTexture(blob) : Promise.resolve(undefined),
      ),
    );
    const toonTextures = await Promise.all(
      blobs.map((blob, textureIndex) =>
        blob && toonTextureIndices.has(textureIndex) ? createPmxToonTexture(blob) : Promise.resolve(undefined),
      ),
    );
    const transparentTextureIndices = new Set(
      [...new Set(pmxModel.materials.map(({ textureIndex }) => textureIndex))].filter((textureIndex) => {
        const image = colourTextures[textureIndex]?.image;
        return image instanceof ImageBitmap && checkTransparentTexels(image);
      }),
    );
    const materials = pmxModel.materials.map((pmxMaterial) =>
      createCharacterMaterial({
        isTextureTransparent: transparentTextureIndices.has(pmxMaterial.textureIndex),
        lightUniforms,
        pmxMaterial,
        rampTexture,
        sphereTexture: colourTextures[pmxMaterial.sphereTextureIndex],
        texture: colourTextures[pmxMaterial.textureIndex],
        toonTexture: pmxMaterial.isToonShared ? undefined : toonTextures[pmxMaterial.toonIndex],
      }),
    );
    return createPmxMesh(pmxModel, materials, getCharacterPmxUnitMetres(characterId));
  });
