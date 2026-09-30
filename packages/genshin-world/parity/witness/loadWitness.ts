import type { SceneLayout } from "genshin-engine";
import type { Material, Texture } from "three";

import { SUBMESH_INDEX_REGEX } from "#parity/witness/constants";
import { createWitnessMaterial } from "#parity/witness/createWitnessMaterial";
import { WitnessProperty } from "#parity/witness/WitnessProperty";
import { Group, Mesh, MeshStandardMaterial, NoColorSpace, SRGBColorSpace, TextureLoader } from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";

// The slots whose textures are colours; every other slot holds data (a normal, a mask) and is read linearly
const COLOR_SLOTS = new Set<string>([WitnessProperty.MainTexture]);
// The witness render's parts: the component's exports laid out as `genshin:assets witness` wrote them, each mesh
// Turned from the export's axes into three's (the export negates x, three negates z, together half a turn about y) and
// Drawn at every placement with the material each of its submeshes names. The meshes and textures are served beside
// The layout, by their export folders
export const loadWitness = async (layoutUrl: string): Promise<Group> => {
  const getUrl = (path: string): string => new URL(path, new URL(layoutUrl, window.location.href)).href;
  const response = await fetch(layoutUrl);
  const layout = (await response.json()) as SceneLayout;
  const objLoader = new OBJLoader();
  const textureLoader = new TextureLoader();
  const meshNames = [...new Set(layout.placements.map(({ mesh }) => mesh))];
  const textureSlots = Object.values(layout.materials).flatMap(({ textures }) => Object.entries(textures));
  const [meshes, textures] = await Promise.all([
    Promise.all(meshNames.map((name) => objLoader.loadAsync(getUrl(`Mesh/${name}.obj`)))),
    Promise.all(
      textureSlots.map(async ([slot, { name }]) => {
        const loaded = await textureLoader.loadAsync(getUrl(`Texture2D/${name}.png`));
        loaded.colorSpace = COLOR_SLOTS.has(slot) ? SRGBColorSpace : NoColorSpace;
        return [name, loaded] as const;
      }),
    ),
  ]);
  const nameTextureMap = new Map<string, Texture>(textures);
  const nameMaterialMap = new Map<string, Material>(
    Object.entries(layout.materials).map(([name, material]) => [name, createWitnessMaterial(material, nameTextureMap)]),
  );
  const fallbackMaterial = new MeshStandardMaterial();
  const nameSubmeshesMap = new Map(
    meshNames.map((name, index) => {
      const submeshes = (meshes[index]?.children ?? []).flatMap((child) => (child instanceof Mesh ? [child] : []));
      for (const { geometry } of submeshes) geometry.rotateY(Math.PI);
      return [name, submeshes] as const;
    }),
  );
  const witness = new Group();
  for (const { materials, mesh, position, rotation, scale } of layout.placements) {
    const part = new Group();
    for (const submesh of nameSubmeshesMap.get(mesh) ?? []) {
      const index = Number(SUBMESH_INDEX_REGEX.exec(submesh.name)?.groups?.index ?? 0);
      const drawn = new Mesh(submesh.geometry, nameMaterialMap.get(materials[index] ?? "") ?? fallbackMaterial);
      drawn.castShadow = true;
      drawn.receiveShadow = true;
      part.add(drawn);
    }
    part.position.set(...position);
    part.quaternion.set(...rotation);
    part.scale.set(...scale);
    witness.add(part);
  }
  return witness;
};
