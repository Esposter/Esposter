import type { DumpedScenePoint } from "#src/models/genshinAssets/world/DumpedScenePoint";

import { DOMAIN_ENTRANCE_AREA_FIELD, DOMAIN_ENTRANCE_POINT } from "#src/services/genshinAssets/domains/constants";
import { SCENE_POINT_FILE } from "#src/services/genshinAssets/shared/constants";
import { readScenePointsOfKind } from "#src/services/genshinAssets/world/readScenePointsOfKind";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Every point the challenge domains' entrances stand at, of the entrances' kind, each by its id. A dump that renamed the
// Transport place or the area would hold none, so it is refused rather than read as a scene with no entrances, or with
// Entrances in no area
export const readDomainEntrancePoints = async (): Promise<Record<string, DumpedScenePoint>> => {
  const points = await readScenePointsOfKind(DOMAIN_ENTRANCE_POINT);
  for (const field of [DOMAIN_ENTRANCE_POINT.position, DOMAIN_ENTRANCE_AREA_FIELD])
    if (!points.some(([, point]) => field in point))
      throw new InvalidOperationError(Operation.Read, SCENE_POINT_FILE, `has no point holding ${field}`);
  return Object.fromEntries(points);
};
