import type { DumpedTransform } from "#src/models/genshinAssets/shared/DumpedTransform";
import type { ObjectPointer } from "#src/models/genshinAssets/shared/ObjectPointer";
import type { SceneDrawing } from "#src/models/genshinAssets/shared/SceneDrawing";
import type { SceneObject } from "#src/models/genshinAssets/shared/SceneObject";

import { LAYOUT_ASSET_TYPES } from "#src/services/genshinAssets/shared/constants";
import { reviveSourcePathId } from "#src/services/genshinAssets/shared/reviveSourcePathId";
import { toObjectKey } from "#src/services/genshinAssets/shared/toObjectKey";
import { toSceneObjects } from "#src/services/genshinAssets/shared/toSceneObjects";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

interface DumpedPointer {
  IsNull?: boolean;
  m_FileID: number;
  m_PathID: string;
  Name?: string;
}
interface GameObject {
  m_Components: { m_PathID: string; Name: string }[];
  m_Name: string;
  m_Transform: { m_GameObject: { m_PathID: string } };
}
type LayoutAssetType = (typeof LAYOUT_ASSET_TYPES)[number];
interface MeshFilter {
  m_GameObject: { m_PathID: string };
  m_Mesh: DumpedPointer;
}
interface MeshRenderer {
  m_GameObject: { m_PathID: string };
  m_Materials: DumpedPointer[];
}
// A skinned renderer draws its mesh itself, with no filter beside it: a part whose pieces a clip moves, such as a door
interface SkinnedMeshRenderer extends MeshRenderer {
  m_Mesh: DumpedPointer;
}
// Every dump of one type in one file of a block, which holds none of a type it has no object of
const readAll = async <T>(directory: string): Promise<T[]> => {
  if (!existsSync(directory)) return [];
  const names = await readdir(directory);
  return Promise.all(
    names.map(async (name) => parseMachineJson<T>(await readFile(join(directory, name), "utf8"), reviveSourcePathId)),
  );
};
const toPointers = (pointers: readonly DumpedPointer[]): ObjectPointer[] =>
  pointers
    .filter(({ IsNull, m_PathID }) => !IsNull && m_PathID !== "0")
    .map(({ m_FileID, m_PathID }) => ({ fileIndex: m_FileID, pathId: m_PathID }));
// A scene's objects from its blocks' JSON dumps, a folder per block holding a folder per type, and in it a folder per
// File (its CAB) the objects were dumped from: every transform, its path ID from its game object where that survived
// The dump (a game object's first component is its transform), and its game object's named components (a script, or an
// Animator by its controller; the engine's others are dumped unnamed). Beside them, what each game object draws, keyed by its file and path ID, which a filter and a renderer (or a
// Skinned renderer alone) name, and every game object and component the dumps hold by its file and path ID, named
// As the game object and what the component is (its script, or its transform first)
export const readSceneLayout = async (
  layoutDirectory: string,
): Promise<{
  gameObjectDrawingMap: Map<string, SceneDrawing>;
  objectNameMap: Map<string, string>;
  objects: SceneObject[];
}> => {
  const objects: SceneObject[] = [];
  const objectNameMap = new Map<string, string>();
  const gameObjectDrawingMap = new Map<string, SceneDrawing>();
  for (const block of await readdir(layoutDirectory)) {
    const getTypeDirectory = (type: LayoutAssetType): string => join(layoutDirectory, block, type);
    // oxlint-disable-next-line no-await-in-loop -- one block's files are listed at a time
    const fileLists = await Promise.all(
      LAYOUT_ASSET_TYPES.map((type) =>
        existsSync(getTypeDirectory(type)) ? readdir(getTypeDirectory(type)) : Promise.resolve([]),
      ),
    );
    for (const file of new Set(fileLists.flat())) {
      const readType = <T>(type: LayoutAssetType): Promise<T[]> => readAll<T>(join(getTypeDirectory(type), file));
      // oxlint-disable-next-line no-await-in-loop -- one file's dump is read at a time, holding its thousands of files
      const [gameObjects, transforms, meshFilters, meshRenderers, skinnedMeshRenderers] = await Promise.all([
        readType<GameObject>("GameObject"),
        readType<DumpedTransform>("Transform"),
        readType<MeshFilter>("MeshFilter"),
        readType<MeshRenderer>("MeshRenderer"),
        readType<SkinnedMeshRenderer>("SkinnedMeshRenderer"),
      ]);
      const gameObjectMaterialsMap = new Map(
        meshRenderers.map(({ m_GameObject, m_Materials }) => [m_GameObject.m_PathID, toPointers(m_Materials)]),
      );
      const gameObjectTransformIdMap = new Map(
        gameObjects.flatMap(({ m_Components, m_Transform }) => {
          const transformId = m_Components[0]?.m_PathID;
          return transformId ? [[m_Transform.m_GameObject.m_PathID, transformId] as const] : [];
        }),
      );
      const gameObjectComponentsMap = new Map(
        gameObjects.map(({ m_Components, m_Transform }) => [
          m_Transform.m_GameObject.m_PathID,
          m_Components.slice(1).flatMap(({ Name }) => (Name ? [Name] : [])),
        ]),
      );
      for (const { m_Components, m_Name, m_Transform } of gameObjects) {
        objectNameMap.set(toObjectKey(file, m_Transform.m_GameObject.m_PathID), m_Name);
        for (const [index, { m_PathID, Name }] of m_Components.entries())
          objectNameMap.set(
            toObjectKey(file, m_PathID),
            `${m_Name}'s ${index === 0 ? "Transform" : Name || "component"}`,
          );
      }
      const fileObjects = toSceneObjects(transforms, {
        block,
        file,
        gameObjectComponentsMap,
        gameObjectTransformIdMap,
      });
      // A game object lost from its dump is still named by its transform, which points at it
      for (const { gameObjectId, name } of fileObjects)
        if (!objectNameMap.has(toObjectKey(file, gameObjectId)))
          objectNameMap.set(toObjectKey(file, gameObjectId), name);
      objects.push(...fileObjects);
      const setDrawing = (gameObjectId: string, mesh: DumpedPointer, materials: ObjectPointer[]): void => {
        gameObjectDrawingMap.set(toObjectKey(file, gameObjectId), {
          materials: materials.map(({ pathId }) => pathId),
          // A skinned mesh in another file is named by its path ID alone, which the asset index names
          mesh: mesh.Name || mesh.m_PathID,
          pointers: [...toPointers([mesh]), ...materials],
        });
      };
      for (const { m_GameObject, m_Mesh } of meshFilters)
        setDrawing(m_GameObject.m_PathID, m_Mesh, gameObjectMaterialsMap.get(m_GameObject.m_PathID) ?? []);
      for (const { m_GameObject, m_Materials, m_Mesh } of skinnedMeshRenderers)
        setDrawing(m_GameObject.m_PathID, m_Mesh, toPointers(m_Materials));
    }
  }
  return { gameObjectDrawingMap, objectNameMap, objects };
};
