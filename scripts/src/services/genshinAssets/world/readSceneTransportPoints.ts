import type { DumpedScenePoint } from "#src/models/genshinAssets/world/DumpedScenePoint";
import type { SceneTransportPoint } from "#src/models/genshinAssets/world/SceneTransportPoint";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { SCENE_POINT_AREA_FIELD } from "#src/services/genshinAssets/shared/constants";
import { DerivedAssetComponentMap } from "#src/services/genshinAssets/shared/DerivedAssetComponentMap";
import { GAME_TEXT_DIRECTORY } from "#src/services/genshinText/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Every transport point of the scene, the kind Windrise's statue is: a statue and a waypoint are one kind of point in the
// Dump, told apart by nothing but what they are placed for. Its kind is the one Windrise's statue's point holds, and the
// Point's place is the vector its exemplar names, a point without one left out
export const readSceneTransportPoints = async (): Promise<SceneTransportPoint[]> => {
  const statuePoint = DerivedAssetComponentMap[DerivedAssetComponent.Windrise].world?.points[0];
  if (!statuePoint) throw new InvalidOperationError(Operation.Read, DerivedAssetComponent.Windrise, "has no point");
  const pointsJson = await readFile(join(GAME_TEXT_DIRECTORY, statuePoint.file), "utf8");
  const categoryPoints =
    parseMachineJson<Record<string, Record<string, DumpedScenePoint> | undefined>>(pointsJson)[statuePoint.category] ??
    {};
  const transportType = categoryPoints[statuePoint.id]?.$type;
  if (transportType === undefined)
    throw new InvalidOperationError(Operation.Read, statuePoint.file, `has no point ${statuePoint.id}`);
  return Object.values(categoryPoints).flatMap((point): SceneTransportPoint[] => {
    const vector = point[statuePoint.position];
    if (point.$type !== transportType || typeof vector !== "object") return [];
    const area = point[SCENE_POINT_AREA_FIELD];
    const { _x = 0, _y = 0, _z = 0 } = vector;
    return [{ area: typeof area === "number" ? area : undefined, height: _y, position: { x: _x, z: _z } }];
  });
};
