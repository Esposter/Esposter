import type { AvatarRigNode } from "#src/models/genshinAssets/avatar/AvatarRigNode";
import type { DumpedMesh } from "#src/models/genshinAssets/avatar/DumpedMesh";
import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { DumpedPointer } from "#src/models/genshinAssets/shared/DumpedPointer";
import type { SceneObject } from "#src/models/genshinAssets/shared/SceneObject";
import type { AvatarRig } from "#src/services/genshinAssets/avatar/readAvatarRig";
import type { RendererBone } from "#src/services/genshinAssets/avatar/readRendererBones";
import type { AvatarBone, AvatarManifest, AvatarMaterial } from "genshin-world/sceneExport";

import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { buildAvatarMesh } from "#src/services/genshinAssets/avatar/buildAvatarMesh";
import { AVATAR_SOURCE_MAP } from "#src/services/genshinAssets/avatar/constants";
import { mirrorAvatarPoint, mirrorAvatarRotation } from "#src/services/genshinAssets/avatar/mirrorAvatarAxes";
import { readAvatarRig } from "#src/services/genshinAssets/avatar/readAvatarRig";
import {
  getTransformKey,
  readRendererBones,
  readRendererRootBone,
  readSkinnedRenderers,
} from "#src/services/genshinAssets/avatar/readRendererBones";
import { createAvatarBinary } from "#src/services/genshinAssets/avatar/writeAvatarBinary";
import { GENSHIN_ANIMESTUDIO_OPTIONS, INSTALLED_BLOCKS_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { readAssetNames } from "#src/services/genshinAssets/shared/readAssetNames";
import { readComponentLayout } from "#src/services/genshinAssets/shared/readComponentLayout";
import { readComponentMaterials } from "#src/services/genshinAssets/shared/readComponentMaterials";
import { readIndexedAssets } from "#src/services/recreation/animeStudio/readIndexedAssets";
import { runAnimeStudio } from "#src/services/recreation/animeStudio/runAnimeStudio";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation, withFinalizerAsync } from "@esposter/shared";
import { AVATAR_BINARY_FILE_NAME, AVATAR_MANIFEST_FILE_NAME } from "genshin-world/sceneExport";
import { existsSync } from "node:fs";
import { readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { crc32 } from "node:zlib";

// A component's game model written beside its exports as its avatar: the rig of its Avatar asset, each of its LOD0
// Meshes skinned to that rig, and the values of the materials they draw with. The rig's bones keep their rest pose, and
// A bone a mesh names that the rig lacks is added under the nearest ancestor the rig has, at the layout's own pose
export const writeAvatar = async (component: DerivedAssetComponent): Promise<string> => {
  const source = AVATAR_SOURCE_MAP[component];
  if (!source) throw new InvalidOperationError(Operation.Create, component, "has no game model to write as an avatar");
  const directory = getComponentDirectory(component);
  const rig = await exportRig(source.block, source.name, directory.root);
  const meshIds = new Map(
    (
      await readIndexedAssets(
        ({ block, name, type }) => block === source.block && type === AssetType.Mesh && source.meshes.includes(name),
        GENSHIN_ANIMESTUDIO_OPTIONS,
      )
    ).map(({ name, pathId }) => [name, pathId]),
  );
  const { objects } = await readComponentLayout(component);
  const objectMap = new Map(objects.map((object) => [getTransformKey(object.file, object.transformId), object]));
  const renderersMap = await readSkinnedRenderers(directory.layout, new Set(meshIds.values()));
  const drawn = await Promise.all(
    source.meshes.map(async (name) => {
      const pathId = meshIds.get(name);
      if (!pathId) throw new InvalidOperationError(Operation.Read, name, `is not in block ${source.block}`);
      const [skinned] = renderersMap.get(pathId) ?? [];
      if (!skinned) throw new InvalidOperationError(Operation.Read, name, "is drawn by no skinned renderer");
      const mesh = parseMachineJson<DumpedMesh>(
        await readFile(join(directory.assets, AssetType.Mesh, `${name}.json`), "utf8"),
      );
      const rootBone = readRendererRootBone(skinned, objectMap);
      if (!rootBone) throw new InvalidOperationError(Operation.Read, name, "has a root bone outside the rig");
      return {
        bones: readRendererBones(skinned, objectMap),
        materialRefs: skinned.renderer.m_Materials,
        mesh,
        name,
        rootBone,
      };
    }),
  );
  const { nodes, paths } = buildSkeleton(rig.nodes, [
    ...drawn.flatMap(({ bones }) => bones),
    ...drawn.map(({ rootBone }) => rootBone),
  ]);
  const nodeOfHash = new Map(paths.map((path, node) => [crc32(path), node]));
  const { materials, names } = await readMaterials(
    component,
    drawn.flatMap(({ materialRefs, mesh }) => materialRefs.slice(0, mesh.m_SubMeshes.length)),
  );
  for (const { mesh, name } of drawn) {
    const unresolved = mesh.m_BoneNameHashes.filter((hash) => !nodeOfHash.has(hash)).length;
    if (unresolved)
      console.warn(`${name}: ${unresolved} bones are in neither the rig nor the layout, and stay unposed`);
  }
  const binary = createAvatarBinary();
  const manifest: AvatarManifest = {
    bones: nodes,
    humanoid: rig.humanoid,
    materials,
    meshes: drawn.map(({ materialRefs, mesh, name, rootBone }) =>
      buildAvatarMesh(
        name,
        mesh,
        mesh.m_BoneNameHashes.map((hash) => nodeOfHash.get(hash) ?? ANIMATOR_ROOT_NODE),
        materialRefs.map(({ m_PathID }) => names.get(m_PathID) ?? ""),
        paths.indexOf(rootBone.path),
        binary,
      ),
    ),
  };
  await writeFile(join(directory.root, AVATAR_BINARY_FILE_NAME), binary.toBuffer());
  const path = join(directory.root, AVATAR_MANIFEST_FILE_NAME);
  await writeFile(path, JSON.stringify(manifest));
  return path;
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

// The rig's root, the animator's own node, which rests at the identity, so a bone the rig and the layout both lack stays
// Where the mesh is drawn
const ANIMATOR_ROOT_NODE = 0;

// The rig's nodes, then every bone a mesh names that the rig lacks, parents first, each in three's axes. A bone's path is
// Its parent's path and its own name, so its parent is found by the path it is cut from
const buildSkeleton = (
  rigNodes: readonly AvatarRigNode[],
  bones: readonly RendererBone[],
): { nodes: AvatarBone[]; paths: string[] } => {
  const nodes: AvatarBone[] = rigNodes.map(({ parent, path, position, rotation, scale }) => ({
    name: leafName(path),
    parent,
    position: mirrorAvatarPoint(position),
    rotation: mirrorAvatarRotation(rotation),
    scale,
  }));
  const paths = rigNodes.map(({ path }) => path);
  const nodeOfPath = new Map(paths.map((path, node) => [path, node]));
  const pathObjectMap = new Map(bones.map(({ object, path }) => [path, object]));
  const sortedPathObjects = [...pathObjectMap.entries()].toSorted(([a], [b]) => depth(a) - depth(b));
  for (const [path, object] of sortedPathObjects) {
    if (nodeOfPath.has(path)) continue;
    const parent = nodeOfPath.get(path.slice(0, Math.max(path.lastIndexOf("/"), 0)));
    if (parent === undefined) throw new InvalidOperationError(Operation.Read, path, "has no ancestor in the rig");
    nodes.push(addedNode(object, parent, leafName(path)));
    paths.push(path);
    nodeOfPath.set(path, nodes.length - 1);
  }
  return { nodes, paths };
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

// The materials the meshes draw with, by name, with each one's values and its texture files by slot, and the name of
// Each material by path ID so a submesh finds its own
const readMaterials = async (
  component: DerivedAssetComponent,
  references: readonly DumpedPointer[],
): Promise<{ materials: Record<string, AvatarMaterial>; names: Map<string, string> }> => {
  const names = await readAssetNames(new Set(references.map(({ m_PathID }) => m_PathID)));
  const usedNames = new Set(names.values());
  const used = (await readComponentMaterials(component)).filter(({ name }) => usedNames.has(name));
  const textureNames = await readAssetNames(
    new Set(used.flatMap(({ textures }) => Object.values(textures).map(({ pathId }) => pathId))),
  );
  const texturesDirectory = join(getComponentDirectory(component).assets, AssetType.Texture2D);
  const materials = Object.fromEntries(
    used.map(({ colors, floats, keywords, name, textures }): [string, AvatarMaterial] => [
      name,
      {
        colors,
        floats,
        keywords,
        textures: Object.fromEntries(
          Object.entries(textures).flatMap(([slot, { pathId }]) => {
            const file = `${textureNames.get(pathId) ?? ""}.png`;
            return existsSync(join(texturesDirectory, file)) ? [[slot, file]] : [];
          }),
        ),
      },
    ]),
  );
  return { materials, names };
};
