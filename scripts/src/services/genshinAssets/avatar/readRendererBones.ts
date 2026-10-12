import type { DumpedSkinnedMeshRenderer } from "#src/models/genshinAssets/shared/DumpedSkinnedMeshRenderer";
import type { SceneObject } from "#src/models/genshinAssets/shared/SceneObject";

import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { RIG_ROOT_BONE_NAME } from "#src/services/genshinAssets/avatar/constants";
import { reviveSourcePathId } from "#src/services/genshinAssets/shared/reviveSourcePathId";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { basename, join } from "node:path";

// A skinned renderer that draws one mesh, as its dump holds it, with the file (its CAB) it lies in
export interface SkinnedRenderer {
  file: string;
  renderer: DumpedSkinnedMeshRenderer;
}

// Every skinned renderer of a layout that draws the mesh by its path ID, read from the dumps of every block's CABs
export const readSkinnedRenderers = async (layoutDirectory: string, meshPathId: string): Promise<SkinnedRenderer[]> => {
  const renderers: SkinnedRenderer[] = [];
  for (const cabDirectory of await listCabDirectories(layoutDirectory)) {
    // oxlint-disable-next-line no-await-in-loop -- one CAB's dumps are read at a time, holding their thousands of files
    const dumps = await readCabRenderers(cabDirectory);
    for (const renderer of dumps)
      if (renderer.m_Mesh.m_PathID === meshPathId) renderers.push({ file: basename(cabDirectory), renderer });
  }
  return renderers;
};

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

// Every bone of a renderer the layout holds up to the rig's root, its path built from the names of the transforms from
// That root down. A bone whose transform the dumps lost is left out, since its path cannot be read, and the rig places
// The bones it holds without one
export const readRendererBones = (
  { file, renderer }: SkinnedRenderer,
  objectMap: ReadonlyMap<string, SceneObject>,
): RendererBone[] =>
  renderer.m_Bones.flatMap(({ m_PathID }): RendererBone[] => {
    const chain: SceneObject[] = [];
    let object = objectMap.get(getTransformKey(file, m_PathID));
    while (object) {
      chain.unshift(object);
      if (object.name === RIG_ROOT_BONE_NAME) break;
      object = objectMap.get(getTransformKey(object.parentFile || object.file, object.parentId));
    }
    const leaf = chain.at(-1);
    if (chain[0]?.name !== RIG_ROOT_BONE_NAME || !leaf) return [];
    return [{ object: leaf, path: chain.map(({ name }) => name).join("/") }];
  });
