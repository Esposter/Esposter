import type { SceneObject } from "#src/models/genshinAssets/SceneObject";

import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

interface GameObject {
  m_Components: { m_PathID: string }[];
  m_Name: string;
  m_Transform: Transform;
}
interface MeshFilter {
  m_GameObject: { Name: string };
  m_Mesh: { Name: string };
}
interface Transform {
  m_Father: { m_PathID: string };
  m_LocalPosition: { X: number; Y: number; Z: number };
  m_LocalRotation: { W: number; X: number; Y: number; Z: number };
  m_LocalScale: { X: number; Y: number; Z: number };
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
// A scene's objects from its blocks' JSON dumps, one folder per block holding a folder per type: each game object with
// Its transform (a game object's first component is its transform), and the mesh each draws by its object's name,
// Which is how a filter names the object it sits on
export const readSceneLayout = async (
  layoutDirectory: string,
): Promise<{ nameMeshMap: Map<string, string>; objects: SceneObject[] }> => {
  const blocks = await readdir(layoutDirectory);
  const objects: SceneObject[] = [];
  const nameMeshMap = new Map<string, string>();
  for (const block of blocks) {
    // oxlint-disable-next-line no-await-in-loop -- one block's dump is read at a time, holding its thousands of files
    const [gameObjects, meshFilters] = await Promise.all([
      readAll<GameObject>(join(layoutDirectory, block, "GameObject")),
      readAll<MeshFilter>(join(layoutDirectory, block, "MeshFilter")),
    ]);
    for (const { m_Components, m_Name, m_Transform } of gameObjects) {
      const transformId = m_Components[0]?.m_PathID;
      if (!transformId) continue;
      const { m_Father, m_LocalPosition: p, m_LocalRotation: r, m_LocalScale: s } = m_Transform;
      objects.push({
        name: m_Name,
        parentId: m_Father.m_PathID,
        position: [p.X, p.Y, p.Z],
        rotation: [r.X, r.Y, r.Z, r.W],
        scale: [s.X, s.Y, s.Z],
        transformId,
      });
    }
    for (const { m_GameObject, m_Mesh } of meshFilters) nameMeshMap.set(m_GameObject.Name, m_Mesh.Name);
  }
  return { nameMeshMap, objects };
};
