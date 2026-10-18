import type { DumpedScenePoint } from "#src/models/genshinAssets/world/DumpedScenePoint";

import { DOMAIN_ENTRANCE_POINT } from "#src/services/genshinAssets/domains/constants";
import { SCENE_POINT_FILE } from "#src/services/genshinAssets/shared/constants";
import { readScenePointsOfKind } from "#src/services/genshinAssets/world/readScenePointsOfKind";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Every point the challenge domains' entrances stand at, of the entrances' kind, each by its id. A dump that renamed the
// Transport place would hold none, so it is refused rather than read as a scene with no entrances
export const readDomainEntrancePoints = async (): Promise<Record<string, DumpedScenePoint>> => {
  const points = await readScenePointsOfKind(DOMAIN_ENTRANCE_POINT);
  if (!points.some(([, point]) => typeof point[DOMAIN_ENTRANCE_POINT.position] === "object"))
    throw new InvalidOperationError(
      Operation.Read,
      SCENE_POINT_FILE,
      `has no point holding ${DOMAIN_ENTRANCE_POINT.position}`,
    );
  return Object.fromEntries(points);
};
