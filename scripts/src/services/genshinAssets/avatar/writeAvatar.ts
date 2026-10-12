import type { AvatarRigNode } from "#src/models/genshinAssets/avatar/AvatarRigNode";
import type { DumpedMesh } from "#src/models/genshinAssets/avatar/DumpedMesh";
import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { MaterialValues } from "#src/models/genshinAssets/shared/MaterialValues";
import type { ResolvedObject } from "#src/models/genshinAssets/shared/ResolvedObject";
import type { SceneObject } from "#src/models/genshinAssets/shared/SceneObject";
import type { CabEntry } from "#src/models/recreation/animeStudio/CabEntry";
import type { AvatarRig } from "#src/services/genshinAssets/avatar/readAvatarRig";
import type { RosterRenderer } from "#src/services/genshinAssets/avatar/readAvatarRoster";
import type { RendererBone } from "#src/services/genshinAssets/avatar/readRendererBones";
import type { AvatarBone, AvatarManifest, AvatarMaterial } from "genshin-world/sceneExport";

import { AnimeStudioExportType } from "#src/models/genshinAssets/shared/AnimeStudioExportType";
import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { buildAvatarMesh } from "#src/services/genshinAssets/avatar/buildAvatarMesh";
import { AVATAR_SOURCE_MAP } from "#src/services/genshinAssets/avatar/constants";
import { mirrorAvatarPoint } from "#src/services/genshinAssets/avatar/mirrorAvatarPoint";
import { mirrorAvatarRotation } from "#src/services/genshinAssets/avatar/mirrorAvatarRotation";
import { readAvatarRig } from "#src/services/genshinAssets/avatar/readAvatarRig";
import { readAvatarRoster } from "#src/services/genshinAssets/avatar/readAvatarRoster";
import {
  readRendererBones,
  readRendererRootBone,
  readSkinnedRenderers,
} from "#src/services/genshinAssets/avatar/readRendererBones";
import { createAvatarBinary } from "#src/services/genshinAssets/avatar/writeAvatarBinary";
import {
  CAB_MAP_PATH,
  GENSHIN_ANIMESTUDIO_OPTIONS,
  INSTALLED_BLOCKS_DIRECTORY,
} from "#src/services/genshinAssets/shared/constants";
import { DerivedAssetComponentMap } from "#src/services/genshinAssets/shared/DerivedAssetComponentMap";
import { exportBlockBySource } from "#src/services/genshinAssets/shared/exportBlockBySource";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { readComponentLayout } from "#src/services/genshinAssets/shared/readComponentLayout";
import { readMaterialValues } from "#src/services/genshinAssets/shared/readMaterialValues";
import { readObjectNames } from "#src/services/genshinAssets/shared/readObjectNames";
import { resolveObjectPointer } from "#src/services/genshinAssets/shared/resolveObjectPointer";
import { toObjectKey } from "#src/services/genshinAssets/shared/toObjectKey";
import { parseCabMap } from "#src/services/recreation/animeStudio/parseCabMap";
import { runAnimeStudio } from "#src/services/recreation/animeStudio/runAnimeStudio";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation, takeOne, withFinalizerAsync } from "@esposter/shared";
import { AVATAR_BINARY_FILE_NAME, AVATAR_MANIFEST_FILE_NAME } from "genshin-world/sceneExport";
import { existsSync } from "node:fs";
import { readFile, rm, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";

// A component's game model written beside its exports as its avatar: the rig of its Avatar asset, each of its LOD0
// Meshes skinned to that rig, and the values of the materials they draw with. Every pointer is resolved through the CAB
// Its renderer lies in, so a mesh or material another CAB names is read from that CAB. The rig's bones keep their rest
// Pose, and a bone a mesh names that the rig lacks is added under the nearest ancestor the rig has, at the layout's pose
export const writeAvatar = async (component: DerivedAssetComponent): Promise<string> => {
  const source = AVATAR_SOURCE_MAP[component];
  if (!source) throw new InvalidOperationError(Operation.Create, component, "has no game model to write as an avatar");
  const directory = getComponentDirectory(component);
  const rig = await exportRig(source.block, source.name, directory.root);
  const cabMap = parseCabMap(await readFile(CAB_MAP_PATH));
  const { objects } = await readComponentLayout(component);
  const objectMap = new Map(objects.map((object) => [toObjectKey(object.file, object.transformId), object]));
  const [modelRoot] = DerivedAssetComponentMap[component].roots;
  const rootObjects = objects.filter(
    ({ gameObjectId, name }) => gameObjectId === modelRoot?.pathId && name === modelRoot.name,
  );
  const [rootObject] = rootObjects;
  if (rootObjects.length !== 1 || !rootObject)
    throw new InvalidOperationError(Operation.Read, component, "has no single model root in its layout");
  const gameObjectMap = new Map(objects.map((object) => [toObjectKey(object.file, object.gameObjectId), object]));
  const renderers = await readSkinnedRenderers(directory.layout, cabMap);
  const meshNames = await readObjectNames(
    renderers.flatMap(({ mesh }) => (mesh ? [mesh] : [])),
    cabMap,
  );
  const materialRefs = renderers
    .filter(({ mesh }) => mesh && meshNames.has(toObjectKey(mesh.file, mesh.pathId)))
    .flatMap(({ materials }) => materials.flatMap((material) => (material ? [material] : [])));
  const materialNames = await readObjectNames(materialRefs, cabMap);
  const materialsDirectory = join(directory.root, "avatar-materials");
  const drawableMaterials = await withFinalizerAsync(
    () => readDrawableMaterials(materialRefs, materialNames, cabMap, materialsDirectory),
    () => rm(materialsDirectory, { force: true, recursive: true }),
  );
  const texturedKeys = new Set(
    [...drawableMaterials].filter(([, { textures }]) => "_MainTex" in textures).map(([key]) => key),
  );
  const candidates = renderers.flatMap((skinned): RosterRenderer[] => {
    const { mesh } = skinned;
    const name = mesh ? meshNames.get(toObjectKey(mesh.file, mesh.pathId)) : undefined;
    return mesh && name !== undefined
      ? [
          {
            ...skinned,
            mesh,
            name,
            object: gameObjectMap.get(toObjectKey(skinned.file, skinned.renderer.m_GameObject.m_PathID)),
          },
        ]
      : [];
  });
  const roster = readAvatarRoster(
    candidates,
    toObjectKey(rootObject.file, rootObject.transformId),
    objectMap,
    texturedKeys,
  );
  if (roster.length === 0)
    throw new InvalidOperationError(Operation.Read, source.name, "has no enabled LOD0 renderer under its model root");
  const meshesDirectory = join(directory.root, "avatar-meshes");
  const meshDumps = await withFinalizerAsync(
    () =>
      readMeshDumps(
        roster.map(({ mesh }) => mesh),
        meshNames,
        meshesDirectory,
      ),
    () => rm(meshesDirectory, { force: true, recursive: true }),
  );
  const drawn = roster.map((skinned) => {
    const { mesh, name } = skinned;
    const dump = meshDumps.get(toObjectKey(mesh.file, mesh.pathId));
    if (!dump) throw new InvalidOperationError(Operation.Read, name, "has no mesh dump");
    const rootBone = readRendererRootBone(skinned, objectMap);
    if (!rootBone) throw new InvalidOperationError(Operation.Read, name, "has a root bone outside the rig");
    return {
      bones: readRendererBones(skinned, name, dump, objectMap),
      materials: skinned.materials,
      mesh: dump,
      name,
      rootBone,
    };
  });
  const { nodeOfPath, nodes } = buildSkeleton(rig.nodes, [
    ...drawn.flatMap(({ bones }) => bones),
    ...drawn.map(({ rootBone }) => rootBone),
  ]);
  const materials = await writeMaterials(
    component,
    cabMap,
    materialNames,
    drawableMaterials,
    drawn.flatMap(({ materials: refs, mesh }) =>
      refs.slice(0, mesh.m_SubMeshes.length).flatMap((ref) => (ref ? [ref] : [])),
    ),
  );
  const binary = createAvatarBinary();
  const manifest: AvatarManifest = {
    bones: nodes,
    humanoid: rig.humanoid,
    materials,
    meshes: drawn.map(({ bones, materials: refs, mesh, name, rootBone }) =>
      buildAvatarMesh(
        name,
        mesh,
        bones.map(({ path }) => readNodeOfPath(nodeOfPath, path)),
        refs.map((ref) => (ref ? materialNames.get(toObjectKey(ref.file, ref.pathId)) : undefined) ?? ""),
        readNodeOfPath(nodeOfPath, rootBone.path),
        binary,
      ),
    ),
  };
  await writeFile(join(directory.root, AVATAR_BINARY_FILE_NAME), binary.toBuffer());
  const path = join(directory.root, AVATAR_MANIFEST_FILE_NAME);
  await writeFile(path, JSON.stringify(manifest));
  return path;
};

// Every mesh's dump, read from the folder of the CAB it lies in: a block's meshes are exported folder by folder per CAB,
// So a mesh's name names it only within its own CAB, and a mesh of another CAB with the same name is never read in its place
const readMeshDumps = async (
  meshes: readonly ResolvedObject[],
  names: ReadonlyMap<string, string>,
  directory: string,
): Promise<Map<string, DumpedMesh>> => {
  for (const block of new Set(meshes.map((mesh) => mesh.block)))
    // oxlint-disable-next-line no-await-in-loop -- AnimeStudio exports one block at a time
    await exportBlockBySource(block, [AssetType.Mesh], AnimeStudioExportType.Json, directory);
  const entries = await Promise.all(
    meshes.map(async (mesh): Promise<[string, DumpedMesh]> => {
      const key = toObjectKey(mesh.file, mesh.pathId);
      const name = names.get(key) ?? "";
      const path = join(directory, basename(mesh.block, ".blk"), AssetType.Mesh, mesh.file, `${name}.json`);
      return [key, parseMachineJson<DumpedMesh>(await readFile(path, "utf8"))];
    }),
  );
  return new Map(entries);
};

// The rig of the Avatar asset, exported from its block into a folder beside the component's exports and removed once read
const exportRig = (block: string, name: string, root: string): Promise<AvatarRig> => {
  const outDirectory = join(root, "avatar-source");
  runAnimeStudio(
    [
      join(INSTALLED_BLOCKS_DIRECTORY, block),
      outDirectory,
      "--types",
      AssetType.Avatar,
      "--names",
      name,
      "--export_type",
      "JSON",
    ],
    GENSHIN_ANIMESTUDIO_OPTIONS,
  );
  return withFinalizerAsync(
    async () => readAvatarRig(await readFile(join(outDirectory, AssetType.Avatar, `${name}.json`), "utf8")),
    () => rm(outDirectory, { force: true, recursive: true }),
  );
};

// The rig's nodes, then every bone a mesh names that the rig lacks, parents first, each in three's axes. A bone's path is
// Its parent's path and its own name, so its parent is found by the path it is cut from
const buildSkeleton = (
  rigNodes: readonly AvatarRigNode[],
  bones: readonly RendererBone[],
): { nodeOfPath: Map<string, number>; nodes: AvatarBone[] } => {
  const nodes: AvatarBone[] = rigNodes.map(({ parent, path, position, rotation, scale }) => ({
    name: leafName(path),
    parent,
    position: mirrorAvatarPoint(position),
    rotation: mirrorAvatarRotation(rotation),
    scale,
  }));
  const nodeOfPath = new Map(rigNodes.map(({ path }, node) => [path, node]));
  const pathObjectMap = new Map(bones.map(({ object, path }) => [path, object]));
  const sortedPathObjects = [...pathObjectMap.entries()].toSorted(([a], [b]) => depth(a) - depth(b));
  for (const [path, object] of sortedPathObjects) {
    if (nodeOfPath.has(path)) continue;
    const parent = nodeOfPath.get(path.slice(0, Math.max(path.lastIndexOf("/"), 0)));
    if (parent === undefined) throw new InvalidOperationError(Operation.Read, path, "has no ancestor in the rig");
    nodes.push(addedNode(object, parent, leafName(path)));
    nodeOfPath.set(path, nodes.length - 1);
  }
  return { nodeOfPath, nodes };
};

// The rig node of a bone's path. Every bone a renderer names is placed in the skeleton, so a path it lacks is an error
const readNodeOfPath = (nodeOfPath: ReadonlyMap<string, number>, path: string): number => {
  const node = nodeOfPath.get(path);
  if (node === undefined) throw new InvalidOperationError(Operation.Read, path, "is not in the avatar's skeleton");
  return node;
};
const addedNode = (object: SceneObject, parent: number, name: string): AvatarBone => ({
  name,
  parent,
  position: mirrorAvatarPoint(object.position),
  rotation: mirrorAvatarRotation(object.rotation),
  scale: object.scale,
});
const leafName = (path: string): string => path.slice(path.lastIndexOf("/") + 1);
const depth = (path: string): number => path.split("/").length;

// A drawable material read as its values from the folder of the CAB it lies in, its texture slots resolved to the textures
// Their pointers name through that same file
interface DrawableMaterial {
  colors: MaterialValues["colors"];
  floats: MaterialValues["floats"];
  keywords: string[];
  textures: Record<string, ResolvedObject>;
}

const readDrawableMaterials = async (
  materials: readonly ResolvedObject[],
  names: ReadonlyMap<string, string>,
  cabMap: ReadonlyMap<string, CabEntry>,
  exportDirectory: string,
): Promise<Map<string, DrawableMaterial>> => {
  // A type's export moves its files into place by name, so the JSON and the raw bytes each take a folder of their own
  const jsonDirectory = join(exportDirectory, "json");
  const rawDirectory = join(exportDirectory, "raw");
  const blocks = new Set(materials.map(({ block }) => block));
  for (const block of blocks)
    // oxlint-disable-next-line no-await-in-loop -- AnimeStudio exports one block at a time
    await exportBlockBySource(block, [AssetType.Material], AnimeStudioExportType.Json, jsonDirectory);
  for (const block of blocks)
    // oxlint-disable-next-line no-await-in-loop -- AnimeStudio exports one block at a time
    await exportBlockBySource(block, [AssetType.Material], AnimeStudioExportType.Raw, rawDirectory);
  const materialValues = await readMaterialValues(
    materials.map((material) => {
      const folderName = join(basename(material.block, ".blk"), AssetType.Material, material.file);
      const name = readName(names, material);
      return {
        jsonPath: join(jsonDirectory, folderName, `${name}.json`),
        rawPath: join(rawDirectory, folderName, `${name}.dat`),
      };
    }),
  );
  return new Map(
    materials.map(({ file, pathId }, index): [string, DrawableMaterial] => {
      const { colors, floats, keywords, textures } = takeOne(materialValues, index);
      return [
        toObjectKey(file, pathId),
        { colors, floats, keywords, textures: resolveTextures(textures, file, cabMap) },
      ];
    }),
  );
};

// The texture each slot points at, through the file its material lies in. An empty slot's pointer names none
const resolveTextures = (
  textures: MaterialValues["textures"],
  file: string,
  cabMap: ReadonlyMap<string, CabEntry>,
): Record<string, ResolvedObject> =>
  Object.fromEntries(
    Object.entries(textures).flatMap(([slot, pointer]): [string, ResolvedObject][] => {
      const texture = resolveObjectPointer(cabMap, file, pointer);
      return texture ? [[slot, texture]] : [];
    }),
  );

// The name an object is exported under, which the asset index must give it
const readName = (names: ReadonlyMap<string, string>, object: ResolvedObject): string => {
  const name = names.get(toObjectKey(object.file, object.pathId));
  if (name === undefined)
    throw new InvalidOperationError(Operation.Read, object.pathId, "has no name in the asset index");
  return name;
};

// Two different objects under one name share one exported file, so it is an error, never one of them picked over the other
const assertUniqueNames = (
  objects: readonly ResolvedObject[],
  names: ReadonlyMap<string, string>,
  kind: string,
): void => {
  const keyOfName = new Map<string, string>();
  for (const object of objects) {
    const key = toObjectKey(object.file, object.pathId);
    const name = readName(names, object);
    const other = keyOfName.get(name);
    if (other !== undefined && other !== key)
      throw new InvalidOperationError(Operation.Read, name, `names two different ${kind}s`);
    keyOfName.set(name, key);
  }
};

// The materials the meshes draw with, keyed by their names, each with its values and the texture files its slots point at
const writeMaterials = async (
  component: DerivedAssetComponent,
  cabMap: ReadonlyMap<string, CabEntry>,
  names: ReadonlyMap<string, string>,
  drawable: ReadonlyMap<string, DrawableMaterial>,
  references: readonly ResolvedObject[],
): Promise<Record<string, AvatarMaterial>> => {
  const textureDirectory = join(getComponentDirectory(component).assets, AssetType.Texture2D);
  const used = [
    ...new Map(references.map((reference) => [toObjectKey(reference.file, reference.pathId), reference])).values(),
  ];
  const materialOf = (reference: ResolvedObject): DrawableMaterial => {
    const material = drawable.get(toObjectKey(reference.file, reference.pathId));
    if (!material) throw new InvalidOperationError(Operation.Read, reference.pathId, "is a drawn material never read");
    return material;
  };
  const textures = used.flatMap((reference) => Object.values(materialOf(reference).textures));
  const textureNames = await readObjectNames(textures, cabMap);
  assertUniqueNames(textures, textureNames, "texture");
  // The manifest keys its materials by name, so two drawn materials under one name are an error, never one overwriting the other
  assertUniqueNames(used, names, "material");
  return Object.fromEntries(
    used.map((reference): [string, AvatarMaterial] => {
      const { colors, floats, keywords, textures: slots } = materialOf(reference);
      return [
        readName(names, reference),
        {
          colors,
          floats,
          keywords,
          textures: Object.fromEntries(
            Object.entries(slots).flatMap(([slot, texture]) => {
              const file = `${readName(textureNames, texture)}.png`;
              return existsSync(join(textureDirectory, file)) ? [[slot, file]] : [];
            }),
          ),
        },
      ];
    }),
  );
};
