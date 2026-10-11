import type { SceneLayout } from "genshin-engine";
import type { Material, Texture } from "three";

import { WitnessProperty } from "#parity/models/witness/WitnessProperty";
import { SUBMESH_INDEX_REGEX } from "#parity/witness/constants";
import { createWitnessMaterial } from "#parity/witness/createWitnessMaterial";
import { SCENE_TEXTURE_ANISOTROPY } from "#src/services/scene/constants";
import { Group, Mesh, MeshStandardMaterial, NoColorSpace, RepeatWrapping, SRGBColorSpace, TextureLoader } from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";

// The slots whose textures are colours; every other slot holds data (a normal, a mask) and is read linearly
const COLOR_SLOTS = new Set<string>([WitnessProperty.MainTexture]);
// The witness render's parts: the component's exports laid out as `genshin:assets witness` wrote them, each mesh
// Turned from the export's axes into three's (the export negates x, three negates z, together half a turn about y) and
// Drawn at every placement with the material each of its submeshes names, in a group per family of the scene's parts
// Its mesh's name falls in, each part named by its mesh; given families, a mesh none of them names is left out, and
// Without them every mesh is drawn in one unnamed family. The meshes and textures are served beside the layout, by
// Their export folders, and only those of the meshes drawn are loaded, each texture once however many slots name it:
// A capital's exports run to over a gigabyte, most of it in meshes no family draws
export const loadWitness = async (
  layoutUrl: string,
  familyMeshRegexMap: Readonly<Record<string, RegExp>> = {},
): Promise<Group> => {
  const getUrl = (path: string): string => new URL(path, new URL(layoutUrl, window.location.href)).href;
  const response = await fetch(layoutUrl);
  const layout = (await response.json()) as SceneLayout;
  const familyEntries = Object.entries(familyMeshRegexMap);
  // A mesh no family names (the sky's dome, an effect's cone) is drawn by the scene's own shaders, not priced here
  const drawnPlacements = layout.placements.flatMap((placement) => {
    const family = familyEntries.find(([, regex]) => regex.test(placement.mesh))?.[0];
    return familyEntries.length > 0 && family === undefined ? [] : [{ family: family ?? "", placement }];
  });
  const meshNames = [...new Set(drawnPlacements.map(({ placement: { mesh } }) => mesh))];
  const drawnMaterialNames = new Set(drawnPlacements.flatMap(({ placement: { materials } }) => materials));
  const drawnMaterials = Object.entries(layout.materials).filter(([name]) => drawnMaterialNames.has(name));
  // Each texture by its name with the slot it is read for, the last slot naming it as the texture map keeps it
  const textureNameSlotMap = new Map(
    drawnMaterials.flatMap(([, { textures }]) => Object.entries(textures).map(([slot, { name }]) => [name, slot])),
  );
  const objLoader = new OBJLoader();
  const textureLoader = new TextureLoader();
  const [meshes, textures] = await Promise.all([
    Promise.all(meshNames.map((name) => objLoader.loadAsync(getUrl(`Mesh/${name}.obj`)))),
    Promise.all(
      Array.from(textureNameSlotMap, async ([name, slot]) => {
        const loaded = await textureLoader.loadAsync(getUrl(`Texture2D/${name}.png`));
        loaded.colorSpace = COLOR_SLOTS.has(slot) ? SRGBColorSpace : NoColorSpace;
        // Tiled past its edges as Unity samples it, since a part's coordinates run past 0 and 1 where it repeats its
        // Texture (the walkway's bricks), and clamped they smear its edge's texels into streaks; and sampled along a
        // Grazing line of sight as the game samples it
        loaded.wrapS = RepeatWrapping;
        loaded.wrapT = RepeatWrapping;
        loaded.anisotropy = SCENE_TEXTURE_ANISOTROPY;
        return [name, loaded] as const;
      }),
    ),
  ]);
  const nameTextureMap = new Map<string, Texture>(textures);
  const nameMaterialMap = new Map<string, Material>(
    drawnMaterials.map(([name, material]) => [name, createWitnessMaterial(material, nameTextureMap)]),
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
  for (const {
    family,
    placement: { materials, mesh, position, rotation, scale },
  } of drawnPlacements) {
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
    getFamilyGroup(family).add(part);
  }
  return witness;
};
