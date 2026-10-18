import { GameDataset } from "#src/models/data/GameDataset";
import { UNLAID_GROUND_REGIONS } from "#src/services/world/constants";

// The lock's ground keys the world lays over Windrise's: each region's own record, and each fitted area's pieces, but not
// Windrise's base nor Mondstadt's
export const selectLaidGroundKeys = <K extends string>(keys: readonly K[]): K[] =>
  keys.filter((key) => {
    const [dataset, region] = key.split("/");
    return dataset === GameDataset.Ground && !UNLAID_GROUND_REGIONS.includes(region ?? "");
  });
