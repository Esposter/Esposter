import { GameDataset } from "#src/models/data/GameDataset";
import { UNLAID_GROUND_REGIONS } from "#src/services/world/constants";

// The lock's ground keys the world lays over Windrise's. A region whose lock holds its plateau, `ground/<region>`, lays
// That alone: it swaps to its pieces only once the plateau's line is retired. A region without one lays its pieces,
// Their keys `ground/<region>/<area>` and their quarters. Windrise's base is read whole, so none of its keys are laid
export const selectLaidGroundKeys = <K extends string>(keys: readonly K[]): K[] => {
  const plateauRegions = new Set(
    keys.flatMap((key) => {
      const [dataset, region, area] = key.split("/");
      return dataset === GameDataset.Ground && area === undefined ? [region ?? ""] : [];
    }),
  );
  return keys.filter((key) => {
    const [dataset, region, area] = key.split("/");
    if (dataset !== GameDataset.Ground || UNLAID_GROUND_REGIONS.includes(region ?? "")) return false;
    return area === undefined || !plateauRegions.has(region ?? "");
  });
};
