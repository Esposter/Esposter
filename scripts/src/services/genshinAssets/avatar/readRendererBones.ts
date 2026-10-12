import type { DumpedMesh } from "#src/models/genshinAssets/avatar/DumpedMesh";
import type { DumpedPointer } from "#src/models/genshinAssets/shared/DumpedPointer";
import type { DumpedSkinnedMeshRenderer } from "#src/models/genshinAssets/shared/DumpedSkinnedMeshRenderer";
import type { ResolvedObject } from "#src/models/genshinAssets/shared/ResolvedObject";
import type { SceneObject } from "#src/models/genshinAssets/shared/SceneObject";
import type { CabEntry } from "#src/models/recreation/animeStudio/CabEntry";

import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { RIG_ROOT_BONE_NAME } from "#src/services/genshinAssets/avatar/constants";
import { resolveObjectPointer } from "#src/services/genshinAssets/shared/resolveObjectPointer";
import { reviveSourcePathId } from "#src/services/genshinAssets/shared/reviveSourcePathId";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { basename, join } from "node:path";

// A skinned renderer as its dump holds it, with the file (its CAB) it lies in. Each pointer it holds is resolved through
// That file's externals, so a pointer with a file index other than zero names its object in another CAB; a pointer that
// Names none, or one whose file the CAB map does not know, is undefined
export interface SkinnedRenderer {
  bones: (ResolvedObject | undefined)[];
  file: string;
  materials: (ResolvedObject | undefined)[];
  mesh?: ResolvedObject;
  renderer: DumpedSkinnedMeshRenderer;
  rootBone?: ResolvedObject;
}

// Every skinned renderer dump of a layout, each with its pointers resolved through the CAB map
export const readSkinnedRenderers = async (
  layoutDirectory: string,
  cabMap: ReadonlyMap<string, CabEntry>,
): Promise<SkinnedRenderer[]> => {
  const renderers: SkinnedRenderer[] = [];
  for (const cabDirectory of await listCabDirectories(layoutDirectory)) {
    const file = basename(cabDirectory);
    // oxlint-disable-next-line no-await-in-loop -- one CAB's dumps are read at a time, holding their thousands of files
    const dumps = await readCabRenderers(cabDirectory);
    for (const renderer of dumps)
      renderers.push({
        bones: renderer.m_Bones.map((pointer) => resolveDumpedPointer(cabMap, file, pointer)),
        file,
        materials: renderer.m_Materials.map((pointer) => resolveDumpedPointer(cabMap, file, pointer)),
        mesh: resolveDumpedPointer(cabMap, file, renderer.m_Mesh),
        renderer,
        rootBone: resolveDumpedPointer(cabMap, file, renderer.m_RootBone),
      });
  }
  return renderers;
};

// A dumped pointer resolved as the object it names, from the file its renderer lies in
const resolveDumpedPointer = (
  cabMap: ReadonlyMap<string, CabEntry>,
  file: string,
  { m_FileID, m_PathID }: DumpedPointer,
): ResolvedObject | undefined => resolveObjectPointer(cabMap, file, { fileIndex: m_FileID, pathId: m_PathID });

// The folders of every CAB holding skinned renderer dumps, under each block of a layout
const listCabDirectories = async (layoutDirectory: string): Promise<string[]> => {
  const typeDirectories = (await readdir(layoutDirectory)).map((block) =>
    join(layoutDirectory, block, AssetType.SkinnedMeshRenderer),
  );
  const cabLists = await Promise.all(
    typeDirectories.map(async (directory) =>
      existsSync(directory) ? (await readdir(directory)).map((file) => join(directory, file)) : [],
    ),
  );
  return cabLists.flat();
};

// One CAB's skinned renderer dumps, each read with its path IDs as their source text
const readCabRenderers = async (cabDirectory: string): Promise<DumpedSkinnedMeshRenderer[]> =>
  Promise.all(
    (await readdir(cabDirectory)).map(async (name) =>
      parseMachineJson<DumpedSkinnedMeshRenderer>(await readFile(join(cabDirectory, name), "utf8"), reviveSourcePathId),
    ),
  );

// A renderer's bone as the layout names it: its path from the renderer's root bone down, and its scene object
export interface RendererBone {
  object: SceneObject;
  path: string;
}

// The layout's objects by the file and path ID of their transform, which a renderer's bones name
export const getTransformKey = (file: string, transformId: string): string => `${file}|${transformId}`;

// The layout's objects by the file and path ID of their game object, which a skinned renderer names
export const getGameObjectKey = (file: string, gameObjectId: string): string => `${file}|${gameObjectId}`;

// A transform's bone as the layout names it: its path from the rig's root down, and its scene object. A transform whose
// Chain the dumps lose, or that does not reach the rig's root, has no path and is undefined
const readBoneChain = (
  file: string,
  transformId: string,
  objectMap: ReadonlyMap<string, SceneObject>,
): RendererBone | undefined => {
  const chain: SceneObject[] = [];
  let object = objectMap.get(getTransformKey(file, transformId));
  while (object) {
    chain.unshift(object);
    if (object.name === RIG_ROOT_BONE_NAME) break;
    object = objectMap.get(getTransformKey(object.parentFile || object.file, object.parentId));
  }
  const leaf = chain.at(-1);
  if (chain[0]?.name !== RIG_ROOT_BONE_NAME || !leaf) return undefined;
  return { object: leaf, path: chain.map(({ name }) => name).join("/") };
};

// The bones of a renderer in the order of its skin's joint indices, which is the order of its mesh's bind poses: joint i
// Is m_Bones[i]. A mesh whose bind poses do not match its renderer's bones is not the mesh the renderer draws, and a bone
// The layout cannot place has no rest, so both throw
export const readRendererBones = (
  skinned: SkinnedRenderer,
  name: string,
  mesh: DumpedMesh,
  objectMap: ReadonlyMap<string, SceneObject>,
): RendererBone[] => {
  if (mesh.m_BindPose.length !== skinned.renderer.m_Bones.length)
    throw new InvalidOperationError(
      Operation.Read,
      name,
      `has ${mesh.m_BindPose.length} bind poses for a renderer of ${skinned.renderer.m_Bones.length} bones`,
    );
  return skinned.bones.map((bone) => {
    const resolved = bone && readBoneChain(bone.file, bone.pathId, objectMap);
    if (!resolved)
      throw new InvalidOperationError(Operation.Read, name, "has a bone the layout does not place in the rig");
    return resolved;
  });
};

// The renderer's root bone, the transform its pose is taken relative to, which the face's light is read against
export const readRendererRootBone = (
  { rootBone }: SkinnedRenderer,
  objectMap: ReadonlyMap<string, SceneObject>,
): RendererBone | undefined => (rootBone ? readBoneChain(rootBone.file, rootBone.pathId, objectMap) : undefined);
