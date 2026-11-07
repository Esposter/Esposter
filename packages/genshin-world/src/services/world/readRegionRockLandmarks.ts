import type { GameDataKey } from "#src/generated/gameDataKeys";
import type { RockLandmark } from "#src/models/world/RockLandmark";
import type { RockRecord } from "#src/models/world/RockRecord";

import { GameDataKeys } from "#src/generated/gameDataKeys";
import { LandmarkKind } from "#src/models/world/LandmarkKind";
import { rockRecordSchema } from "#src/models/world/RockRecord";
import { readGameData } from "#src/services/data/readGameData";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A rocks record as its rock landmarks, one for each place a rock stands in. A hull no place stands is drawn nowhere, and
// A place whose hull the record does not hold is a broken record, so it is an error rather than a rock left out
export const toRockLandmarks = (regionId: string, { hulls, placements }: RockRecord): RockLandmark[] =>
  placements.map(({ hull, position, rotation, scale }, index) => {
    const boxes = hulls[hull];
    if (boxes === undefined)
      throw new InvalidOperationError(Operation.Read, hull, "has no hull in its region's rocks record");
    return {
      boxes,
      hull,
      id: `${regionId}-rock-${index}`,
      kind: LandmarkKind.Rock,
      place: position,
      scale,
      turn: rotation,
    };
  });

// A region's rock landmarks, read from its rocks record by the key the lock holds for it, as the region comes within reach.
// A region the lock holds no rocks record for draws none
export const readRegionRockLandmarks = async (gameDataBaseUrl: string, regionId: string): Promise<RockLandmark[]> => {
  const key = (GameDataKeys.regions as Partial<Record<string, { rocks?: GameDataKey }>>)[regionId]?.rocks;
  return key === undefined ? [] : toRockLandmarks(regionId, await readGameData(gameDataBaseUrl, key, rockRecordSchema));
};
