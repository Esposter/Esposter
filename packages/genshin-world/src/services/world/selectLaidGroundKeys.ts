import { GameDataset } from "#src/models/data/GameDataset";
import { UNLAID_GROUND_REGIONS } from "#src/services/world/constants";
import { selectRegionGroundKeys } from "#src/services/world/selectRegionGroundKeys";

// The lock's ground keys the world lays over Windrise's: each region's, through the selection every region's ground is
// Read by, a plateau alone while the lock holds it and else its pieces. Windrise's base is read whole, so none of its are laid
export const selectLaidGroundKeys = <K extends string>(keys: readonly K[]): K[] => {
  const regions = new Set(
    keys.flatMap((key) => {
      const [dataset, region = ""] = key.split("/");
      return dataset === GameDataset.Ground && !UNLAID_GROUND_REGIONS.includes(region) ? [region] : [];
    }),
  );
  return [...regions].flatMap((region) => selectRegionGroundKeys(keys, region));
};
