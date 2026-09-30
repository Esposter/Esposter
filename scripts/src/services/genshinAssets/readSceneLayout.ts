import type { AssetPlacement } from "#src/models/genshinAssets/AssetPlacement";
import type { DumpedTransform } from "#src/models/genshinAssets/DumpedTransform";
import type { SceneObject } from "#src/models/genshinAssets/SceneObject";

import { reviveSourcePathId } from "#src/services/genshinAssets/reviveSourcePathId";
import { toSceneObjects } from "#src/services/genshinAssets/toSceneObjects";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

interface GameObject {
  m_Components: { m_PathID: string }[];
  m_Transform: { m_GameObject: { m_PathID: string } };
}
interface MeshFilter {
  m_GameObject: { Name: string };
  m_Mesh: { Name: string };
}
interface MeshRenderer {
  m_GameObject: { Name: string };
  m_Materials: { IsNull: boolean; m_PathID: string }[];
}
// A skinned renderer draws its mesh itself, with no filter beside it: a part whose pieces a clip moves, such as a door
interface SkinnedMeshRenderer extends MeshRenderer {
  m_Mesh: { m_PathID: string; Name: string };
}
// Every dump of one type in a block, which holds none of a type it has no object of
const readAll = async <T>(directory: string): Promise<T[]> => {
  if (!existsSync(directory)) return [];
  const names = await readdir(directory);
  return Promise.all(
    names.map(async (name) => parseMachineJson<T>(await readFile(join(directory, name), "utf8"), reviveSourcePathId)),
  );
};
// A scene's objects from its blocks' JSON dumps, one folder per block holding a folder per type: every transform, its
// Path ID from its game object where that survived the dump (a game object's first component is its transform), and
// The mesh each object draws and the materials it draws it with, by its name, which is how a filter and a renderer (or
// A skinned renderer alone) name the object they sit on
export const readSceneLayout = async (
  layoutDirectory: string,
): Promise<{ nameDrawingMap: Map<string, Pick<AssetPlacement, "materials" | "mesh">>; objects: SceneObject[] }> => {
  const blocks = await readdir(layoutDirectory);
  const objects: SceneObject[] = [];
  const nameDrawingMap = new Map<string, Pick<AssetPlacement, "materials" | "mesh">>();
  for (const block of blocks) {
    // oxlint-disable-next-line no-await-in-loop -- one block's dump is read at a time, holding its thousands of files
    const [gameObjects, transforms, meshFilters, meshRenderers, skinnedMeshRenderers] = await Promise.all([
      readAll<GameObject>(join(layoutDirectory, block, "GameObject")),
      readAll<DumpedTransform>(join(layoutDirectory, block, "Transform")),
      readAll<MeshFilter>(join(layoutDirectory, block, "MeshFilter")),
      readAll<MeshRenderer>(join(layoutDirectory, block, "MeshRenderer")),
      readAll<SkinnedMeshRenderer>(join(layoutDirectory, block, "SkinnedMeshRenderer")),
    ]);
    const nameMaterialsMap = new Map(
      meshRenderers.map(({ m_GameObject, m_Materials }) => [
        m_GameObject.Name,
        m_Materials.filter(({ IsNull }) => !IsNull).map(({ m_PathID }) => m_PathID),
      ]),
    );
    const gameObjectTransformIdMap = new Map(
      gameObjects.flatMap(({ m_Components, m_Transform }) => {
        const transformId = m_Components[0]?.m_PathID;
        return transformId ? [[m_Transform.m_GameObject.m_PathID, transformId] as const] : [];
      }),
    );
    objects.push(...toSceneObjects(transforms, gameObjectTransformIdMap));
    for (const { m_GameObject, m_Mesh } of meshFilters)
      nameDrawingMap.set(m_GameObject.Name, {
        materials: nameMaterialsMap.get(m_GameObject.Name) ?? [],
        mesh: m_Mesh.Name,
      });
    // A skinned mesh in another file is named by its path ID alone, which the asset index names
    for (const { m_GameObject, m_Materials, m_Mesh } of skinnedMeshRenderers)
      nameDrawingMap.set(m_GameObject.Name, {
        materials: m_Materials.filter(({ IsNull }) => !IsNull).map(({ m_PathID }) => m_PathID),
        mesh: m_Mesh.Name || m_Mesh.m_PathID,
      });
  }
  return { nameDrawingMap, objects };
};
