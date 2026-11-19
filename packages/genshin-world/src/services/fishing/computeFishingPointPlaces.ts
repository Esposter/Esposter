import type { FishingPointPlace } from "#src/models/fishing/FishingPointPlace";

// The fishing points that show, those of each region whose stock still has fish at the hour, in the region order given
export const computeFishingPointPlaces = (
  fishingPoints: Readonly<Record<string, FishingPointPlace[]>>,
  regionIds: string[],
  hasStock: (region: string) => boolean,
): FishingPointPlace[] =>
  regionIds.filter((region) => hasStock(region)).flatMap((region) => fishingPoints[region] ?? []);
