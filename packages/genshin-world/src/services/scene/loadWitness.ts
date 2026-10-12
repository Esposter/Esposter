import type { LoadedWitness } from "#src/models/scene/LoadedWitness";
import type { WitnessMaterialFactory } from "#src/models/scene/WitnessMaterialFactory";
import type { SceneLayout } from "genshin-engine";
import type { BufferGeometry, InstancedMesh, Material, Texture } from "three";

import { WitnessProperty } from "#src/models/scene/WitnessProperty";
import {
  MOVING_PART_FAMILIES,
  RIGID_PIECE_FAMILIES,
  SCENE_TEXTURE_ANISOTROPY,
  SUBMESH_INDEX_REGEX,
} from "#src/services/scene/constants";
import { createWitnessMaterial } from "#src/services/scene/createWitnessMaterial";
import { readObjFaceVertices } from "#src/services/scene/readObjFaceVertices";
import { splitRigidPieces } from "#src/services/scene/splitRigidPieces";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { createInstancedMesh } from "genshin-engine";
import {
  Group,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  NoColorSpace,
  Quaternion,
  RepeatWrapping,
  SRGBColorSpace,
  TextureLoader,
  Vector3,
} from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";

// The slots whose textures are colours; every other slot holds data (a normal, a mask) and is read linearly
const COLOR_SLOTS = new Set<string>([WitnessProperty.MainTexture]);
// The skin of a mesh as its export's JSON holds it, the bones each vertex follows strongest first
interface ExportedSkin {
  m_Skin: { boneIndex: number[] }[];
}
// A component's exports laid out as `genshin:assets witness` wrote them, each mesh turned from the export's axes into
// Three's (the export negates x, three negates z, together half a turn about y) and drawn at every placement with the
// Material each of its submeshes names, laid over one the host makes, in a group per family of the scene's parts its
// Mesh's name falls in; given families, a mesh none of them names is left out, and without them every mesh is drawn in
// One unnamed family. A family's placements of one submesh in one material are one instanced mesh named by its mesh,
// Set once, since they stand still: a capital places tens of thousands of parts, which the renderer would otherwise walk
// And project in every pass of every frame. A moving family's parts each stand in a group named by its mesh instead,
// For its scene to move, and a rigidly skinned family's in a group per piece its bones carry. The meshes and textures
// Are served beside the layout, by their export folders, and only those of the meshes drawn are loaded, each texture
// Once however many slots name it: a capital's exports run to over a gigabyte, most of it in meshes no family draws
export const loadWitness = async (
  layoutUrl: string,
  createMaterial: WitnessMaterialFactory,
  familyMeshRegexMap: Readonly<Record<string, RegExp>> = {},
): Promise<LoadedWitness> => {
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
  const rigidMeshNames = new Set(
    drawnPlacements.flatMap(({ family, placement: { mesh } }) => (RIGID_PIECE_FAMILIES.has(family) ? [mesh] : [])),
  );
  const drawnMaterialNames = new Set(drawnPlacements.flatMap(({ placement: { materials } }) => materials));
  const drawnMaterials = Object.entries(layout.materials).filter(([name]) => drawnMaterialNames.has(name));
  // Each texture by its name with the slot it is read for, the last slot naming it as the texture map keeps it
  const textureNameSlotMap = new Map(
    drawnMaterials.flatMap(([, { textures }]) => Object.entries(textures).map(([slot, { name }]) => [name, slot])),
  );
  const objLoader = new OBJLoader();
  const textureLoader = new TextureLoader();
  const [meshes, textures] = await Promise.all([
    Promise.all(
      meshNames.map(async (name) => {
        const objUrl = getUrl(`Mesh/${name}.obj`);
        if (!rigidMeshNames.has(name)) return { object: await objLoader.loadAsync(objUrl) };
        const [objResponse, skinResponse] = await Promise.all([fetch(objUrl), fetch(getUrl(`Mesh/${name}.json`))]);
        if (!objResponse.ok)
          throw new InvalidOperationError(
            Operation.Read,
            objUrl,
            `HTTP ${objResponse.status} ${objResponse.statusText}`,
          );
        const text = await objResponse.text();
        const { m_Skin } = (await skinResponse.json()) as ExportedSkin;
        return {
          object: objLoader.parse(text),
          rigidPieces: {
            groupFaceVerticesMap: readObjFaceVertices(text),
            vertexPieces: m_Skin.map(({ boneIndex: [bone = 0] }) => bone),
          },
        };
      }),
    ),
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
    drawnMaterials.map(([name, material]) => [name, createWitnessMaterial(material, nameTextureMap, createMaterial)]),
  );
  const fallbackMaterial = new MeshStandardMaterial();
  // Each mesh's submeshes, a rigidly skinned one's split into its pieces, each piece by the bone carrying it
  const nameSubmeshesMap = new Map(
    meshNames.map((name, index) => {
      const { object, rigidPieces } = meshes[index] ?? {};
      const submeshes = (object?.children ?? []).flatMap((child) => (child instanceof Mesh ? [child] : []));
      return [
        name,
        submeshes.flatMap((submesh): { geometry: BufferGeometry; name: string; piece?: number }[] => {
          const { geometry, name: submeshName } = submesh;
          geometry.rotateY(Math.PI);
          if (!rigidPieces) return [{ geometry, name: submeshName }];
          const pieceGeometryMap = splitRigidPieces(
            submesh,
            rigidPieces.groupFaceVerticesMap.get(submeshName) ?? [],
            rigidPieces.vertexPieces,
          );
          geometry.dispose();
          return Array.from(pieceGeometryMap, ([piece, pieceGeometry]) => ({
            geometry: pieceGeometry,
            name: submeshName,
            piece,
          }));
        }),
      ] as const;
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
  // Each instanced mesh's placements, by its family, submesh and material
  const instanceGroupMap = new Map<
    string,
    { family: string; geometry: BufferGeometry; material: Material; matrices: Matrix4[]; mesh: string }
  >();
  for (const {
    family,
    placement: { materials, mesh, position, rotation, scale },
  } of drawnPlacements) {
    const isMoving = MOVING_PART_FAMILIES.has(family);
    // Only a moving part is a group of its own, so an instanced placement allocates none
    let part: Group | undefined;
    const matrix = new Matrix4().compose(new Vector3(...position), new Quaternion(...rotation), new Vector3(...scale));
    for (const submesh of nameSubmeshesMap.get(mesh) ?? []) {
      const material =
        nameMaterialMap.get(materials[Number(SUBMESH_INDEX_REGEX.exec(submesh.name)?.groups?.index ?? 0)] ?? "") ??
        fallbackMaterial;
      if (isMoving) {
        const drawn = new Mesh(submesh.geometry, material);
        drawn.castShadow = true;
        drawn.receiveShadow = true;
        part ??= new Group();
        if (submesh.piece === undefined) part.add(drawn);
        else {
          const pieceName = String(submesh.piece);
          let piece = part.children.find(({ name }) => name === pieceName);
          if (!piece) {
            piece = new Group();
            piece.name = pieceName;
            part.add(piece);
          }
          piece.add(drawn);
        }
        continue;
      }
      const key = `${family}/${submesh.geometry.uuid}/${material.uuid}`;
      const instanceGroup = instanceGroupMap.get(key);
      if (instanceGroup) instanceGroup.matrices.push(matrix);
      else instanceGroupMap.set(key, { family, geometry: submesh.geometry, material, matrices: [matrix], mesh });
    }
    if (part === undefined) continue;
    part.name = mesh;
    part.applyMatrix4(matrix);
    getFamilyGroup(family).add(part);
  }
  const instancedMeshes = Array.from(
    instanceGroupMap.values(),
    ({ family, geometry, material, matrices, mesh }): InstancedMesh => {
      const instancedMesh = createInstancedMesh(geometry, material, matrices.length);
      instancedMesh.name = mesh;
      for (const [index, matrix] of matrices.entries()) instancedMesh.setMatrixAt(index, matrix);
      instancedMesh.computeBoundingBox();
      instancedMesh.computeBoundingSphere();
      instancedMesh.castShadow = true;
      instancedMesh.receiveShadow = true;
      instancedMesh.matrixAutoUpdate = false;
      getFamilyGroup(family).add(instancedMesh);
      return instancedMesh;
    },
  );
  const geometries = [...nameSubmeshesMap.values()].flatMap((submeshes) =>
    submeshes.map(({ geometry }): BufferGeometry => geometry),
  );
  return {
    dispose: () => {
      for (const disposable of [
        ...geometries,
        ...nameMaterialMap.values(),
        fallbackMaterial,
        ...nameTextureMap.values(),
        ...instancedMeshes,
      ])
        disposable.dispose();
    },
    parts: witness,
  };
};
