import type { FishingPropPlace } from "#src/models/fishing/FishingPropPlace";

// The places one fishing-area prop stands at in its region: each record the region's layout gives that name, with the
// Place, turn and scale the record holds. A name with no record in the region has no place, so nothing is drawn for it
export const computeFishingPropPlacements = (name: string, places: readonly FishingPropPlace[]): FishingPropPlace[] =>
  places.filter((place) => place.name === name);
