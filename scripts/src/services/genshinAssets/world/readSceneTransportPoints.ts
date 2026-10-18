import type { SceneTransportPoint } from "#src/models/genshinAssets/world/SceneTransportPoint";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { SCENE_POINT_AREA_FIELD } from "#src/services/genshinAssets/shared/constants";
import { DerivedAssetComponentMap } from "#src/services/genshinAssets/shared/DerivedAssetComponentMap";
import { readScenePointsOfKind } from "#src/services/genshinAssets/world/readScenePointsOfKind";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Every transport point of the scene, the kind Windrise's statue is: a statue and a waypoint are one kind of point in the
// Dump, told apart by nothing but what they are placed for. The point's place is the vector its exemplar names, a point
// Without one left out
export const readSceneTransportPoints = async (): Promise<SceneTransportPoint[]> => {
  const statuePoint = DerivedAssetComponentMap[DerivedAssetComponent.Windrise].world?.points[0];
  if (!statuePoint) throw new InvalidOperationError(Operation.Read, DerivedAssetComponent.Windrise, "has no point");
  const points = await readScenePointsOfKind(statuePoint);
  return points.flatMap(([, point]): SceneTransportPoint[] => {
    const vector = point[statuePoint.position];
    if (typeof vector !== "object") return [];
    const area = point[SCENE_POINT_AREA_FIELD];
    const { x = 0, y = 0, z = 0 } = vector;
    return [{ area: typeof area === "number" ? area : undefined, height: y, position: { x, z } }];
  });
};
