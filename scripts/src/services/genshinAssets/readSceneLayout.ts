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
  m_Components: { m_PathID: string; Name: string }[];
  m_Transform: { m_GameObject: { m_PathID: string } };
}
interface MeshFilter {
  m_GameObject: { m_PathID: string };
  m_Mesh: { Name: string };
}
interface MeshRenderer {
  m_GameObject: { m_PathID: string };
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
const toMaterialIds = (materials: MeshRenderer["m_Materials"]): string[] =>
  materials.filter(({ IsNull }) => !IsNull).map(({ m_PathID }) => m_PathID);
// A scene's objects from its blocks' JSON dumps, one folder per block holding a folder per type: every transform, its
// Path ID from its game object where that survived the dump (a game object's first component is its transform), and
// Its game object's scripts, the components the dump names. Beside them, the mesh each game object draws and the
// Materials it draws it with, by the game object's path ID, which a filter and a renderer (or a skinned renderer
// Alone) name
export const readSceneLayout = async (
  layoutDirectory: string,
): Promise<{
  gameObjectDrawingMap: Map<string, Pick<AssetPlacement, "materials" | "mesh">>;
  objects: SceneObject[];
}> => {
  const blocks = await readdir(layoutDirectory);
  const objects: SceneObject[] = [];
  const gameObjectDrawingMap = new Map<string, Pick<AssetPlacement, "materials" | "mesh">>();
  for (const block of blocks) {
    // oxlint-disable-next-line no-await-in-loop -- one block's dump is read at a time, holding its thousands of files
    const [gameObjects, transforms, meshFilters, meshRenderers, skinnedMeshRenderers] = await Promise.all([
      readAll<GameObject>(join(layoutDirectory, block, "GameObject")),
      readAll<DumpedTransform>(join(layoutDirectory, block, "Transform")),
      readAll<MeshFilter>(join(layoutDirectory, block, "MeshFilter")),
      readAll<MeshRenderer>(join(layoutDirectory, block, "MeshRenderer")),
      readAll<SkinnedMeshRenderer>(join(layoutDirectory, block, "SkinnedMeshRenderer")),
    ]);
    const gameObjectMaterialsMap = new Map(
      meshRenderers.map(({ m_GameObject, m_Materials }) => [m_GameObject.m_PathID, toMaterialIds(m_Materials)]),
    );
    const gameObjectTransformIdMap = new Map(
      gameObjects.flatMap(({ m_Components, m_Transform }) => {
        const transformId = m_Components[0]?.m_PathID;
        return transformId ? [[m_Transform.m_GameObject.m_PathID, transformId] as const] : [];
      }),
    );
    // A component the dump names is a script; the engine's own (a renderer, an animator) are dumped unnamed
    const gameObjectScriptsMap = new Map(
      gameObjects.map(({ m_Components, m_Transform }) => [
        m_Transform.m_GameObject.m_PathID,
        m_Components.slice(1).flatMap(({ Name }) => (Name ? [Name] : [])),
      ]),
    );
    objects.push(...toSceneObjects(transforms, { block, gameObjectScriptsMap, gameObjectTransformIdMap }));
    for (const { m_GameObject, m_Mesh } of meshFilters)
      gameObjectDrawingMap.set(m_GameObject.m_PathID, {
        materials: gameObjectMaterialsMap.get(m_GameObject.m_PathID) ?? [],
        mesh: m_Mesh.Name,
      });
    // A skinned mesh in another file is named by its path ID alone, which the asset index names
    for (const { m_GameObject, m_Materials, m_Mesh } of skinnedMeshRenderers)
      gameObjectDrawingMap.set(m_GameObject.m_PathID, {
        materials: toMaterialIds(m_Materials),
        mesh: m_Mesh.Name || m_Mesh.m_PathID,
      });
  }
  return { gameObjectDrawingMap, objects };
};
