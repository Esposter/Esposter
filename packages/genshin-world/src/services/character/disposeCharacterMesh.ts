import type { ToonNodeMaterial } from "genshin-engine";
import type { BufferGeometry, SkinnedMesh, Texture } from "three";

// Only a pack's own textures are decoded from a bitmap, so the world's ramps, shared by every model, are left alive
const checkIsPackTexture = (texture: null | Texture | undefined): texture is Texture<ImageBitmap> =>
  texture?.image instanceof ImageBitmap;
// Releases a character's model: its geometry, skeleton and materials, and each texture several materials draw with
// Once, its decoded image closed with it, which three leaves open
export const disposeCharacterMesh = ({
  geometry,
  material,
  skeleton,
}: SkinnedMesh<BufferGeometry, ToonNodeMaterial[]>): void => {
  geometry.dispose();
  skeleton.dispose();
  for (const characterMaterial of material) characterMaterial.dispose();
  const packTextures = material.flatMap(({ gradientMap, map, sphereMap }) => [gradientMap, map, sphereMap]);
  for (const texture of new Set(packTextures.filter((packTexture) => checkIsPackTexture(packTexture)))) {
    texture.dispose();
    texture.image.close();
  }
};
