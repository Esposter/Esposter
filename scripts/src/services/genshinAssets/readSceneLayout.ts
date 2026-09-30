import type { DumpedTransform } from "#src/models/genshinAssets/DumpedTransform";
import type { SceneObject } from "#src/models/genshinAssets/SceneObject";

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
// A path ID is 64 bits, past what a number holds exactly, so it is read from its own source text
const readPathId = (key: string, value: unknown, { source }: { source?: string }): unknown =>
  key === "m_PathID" && source !== undefined ? source : value;
// Every dump of one type in a block, which holds none of a type it has no object of
const readAll = async <T>(directory: string): Promise<T[]> => {
  if (!existsSync(directory)) return [];
  const names = await readdir(directory);
  return Promise.all(
    names.map(async (name) => parseMachineJson<T>(await readFile(join(directory, name), "utf8"), readPathId)),
  );
};
// A scene's objects from its blocks' JSON dumps, one folder per block holding a folder per type: every transform, its
// Path ID from its game object where that survived the dump (a game object's first component is its transform), and
// The mesh each object draws by its name, which is how a filter names the object it sits on
export const readSceneLayout = async (
  layoutDirectory: string,
): Promise<{ nameMeshMap: Map<string, string>; objects: SceneObject[] }> => {
  const blocks = await readdir(layoutDirectory);
  const objects: SceneObject[] = [];
  const nameMeshMap = new Map<string, string>();
  for (const block of blocks) {
    // oxlint-disable-next-line no-await-in-loop -- one block's dump is read at a time, holding its thousands of files
    const [gameObjects, transforms, meshFilters] = await Promise.all([
      readAll<GameObject>(join(layoutDirectory, block, "GameObject")),
      readAll<DumpedTransform>(join(layoutDirectory, block, "Transform")),
      readAll<MeshFilter>(join(layoutDirectory, block, "MeshFilter")),
    ]);
    const gameObjectTransformIdMap = new Map(
      gameObjects.flatMap(({ m_Components, m_Transform }) => {
        const transformId = m_Components[0]?.m_PathID;
        return transformId ? [[m_Transform.m_GameObject.m_PathID, transformId] as const] : [];
      }),
    );
    objects.push(...toSceneObjects(transforms, gameObjectTransformIdMap));
    for (const { m_GameObject, m_Mesh } of meshFilters) nameMeshMap.set(m_GameObject.Name, m_Mesh.Name);
  }
  return { nameMeshMap, objects };
};
