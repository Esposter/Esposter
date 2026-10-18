import type { SceneBuildingPoint } from "genshin-world";

import { SCENE_BUILDING_NAME_FIELD, SCENE_BUILDING_POINT } from "#src/services/genshinAssets/sceneGroups/constants";
import { readScenePointsOfKind } from "#src/services/genshinAssets/world/readScenePointsOfKind";
import { toDumpedVector } from "#src/services/genshinAssets/world/toDumpedVector";
import { SceneGroupSource } from "genshin-world";

// Every building point of the scene by its point id, the service it marks and its place as the scene's points give them.
// A point naming no service or holding no place is left out
export const readSceneBuildingPoints = async (): Promise<Record<string, SceneBuildingPoint>> => {
  const points = await readScenePointsOfKind(SCENE_BUILDING_POINT);
  return Object.fromEntries(
    points.flatMap(([id, point]): [string, SceneBuildingPoint][] => {
      const name = point[SCENE_BUILDING_NAME_FIELD];
      const position = point[SCENE_BUILDING_POINT.position];
      const rotation = point[SCENE_BUILDING_POINT.rotation];
      if (typeof name !== "string" || name === "" || typeof position !== "object") return [];
      const { x = 0, y = 0, z = 0 } = toDumpedVector(position);
      // A turn the dump leaves out is none, as it leaves out a vector's zero fields
      const { y: rotationY = 0 } = toDumpedVector(rotation);
      return [
        [id, { name, place: { height: y, position: { x, z }, rotationY, source: SceneGroupSource.ScenePoints } }],
      ];
    }),
  );
};
