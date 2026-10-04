import type { SceneLayout } from "genshin-engine";
import type { Material, Texture } from "three";

import { SUBMESH_INDEX_REGEX } from "#parity/witness/constants";
import { createWitnessMaterial } from "#parity/witness/createWitnessMaterial";
import { WitnessProperty } from "#parity/witness/WitnessProperty";
import { Group, Mesh, MeshStandardMaterial, NoColorSpace, RepeatWrapping, SRGBColorSpace, TextureLoader } from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";

// The slots whose textures are colours; every other slot holds data (a normal, a mask) and is read linearly
const COLOR_SLOTS = new Set<string>([WitnessProperty.MainTexture]);
// The witness render's parts: the component's exports laid out as `genshin:assets witness` wrote them, each mesh
// Turned from the export's axes into three's (the export negates x, three negates z, together half a turn about y) and
// Drawn at every placement with the material each of its submeshes names, in a group per family of the scene's parts
// Its mesh's name falls in, each part named by its mesh; given families, a mesh none of them names is left out, and
// Without them every mesh is drawn in one unnamed family. The meshes and textures are served
// Beside the layout, by their export folders
export const loadWitness = async (
  layoutUrl: string,
  familyMeshRegexMap: Readonly<Record<string, RegExp>> = {},
): Promise<Group> => {
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
        // Tiled past its edges as Unity samples it, since a part's coordinates run past 0 and 1 where it repeats its
        // Texture (the walkway's bricks), and clamped they smear its edge's texels into streaks
        loaded.wrapS = RepeatWrapping;
        loaded.wrapT = RepeatWrapping;
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
  const getFamilyGroup = (family: string): Group => {
    // Only its children: the root's own name is empty too, which `getObjectByName` would match for the unnamed family
    const familyGroup = witness.children.find(({ name }) => name === family);
    if (familyGroup instanceof Group) return familyGroup;
    const group = new Group();
    group.name = family;
    witness.add(group);
    return group;
  };
  const familyEntries = Object.entries(familyMeshRegexMap);
  for (const { materials, mesh, position, rotation, scale } of layout.placements) {
    const family = familyEntries.find(([, regex]) => regex.test(mesh))?.[0];
    // A mesh no family names (the sky's dome, an effect's cone) is drawn by the scene's own shaders, not priced here
    if (familyEntries.length > 0 && family === undefined) continue;
    const part = new Group();
    part.name = mesh;
    for (const submesh of nameSubmeshesMap.get(mesh) ?? []) {
      const material = materials[Number(SUBMESH_INDEX_REGEX.exec(submesh.name)?.groups?.index ?? 0)] ?? "";
      const drawn = new Mesh(submesh.geometry, nameMaterialMap.get(material) ?? fallbackMaterial);
      drawn.castShadow = true;
      drawn.receiveShadow = true;
      part.add(drawn);
    }
    part.position.set(...position);
    part.quaternion.set(...rotation);
    part.scale.set(...scale);
    getFamilyGroup(family ?? "").add(part);
  }
  return witness;
};
