import type { FishingPropPlace } from "#src/models/fishing/FishingPropPlace";

// The places one fishing-area prop stands at in its region: each record the region's layout gives that name, with the turn
// And scale the record holds, and its height taken from the world's ground beneath its place. The layout's own height is
// Not kept, as it does not match the ground at every place. A name with no record in the region has no place, so nothing
// Is drawn for it
export const computeFishingPropPlacements = (
  name: string,
  places: readonly FishingPropPlace[],
  getGroundHeight: (x: number, z: number) => number,
): FishingPropPlace[] =>
  places
    .filter((place) => place.name === name)
    .map((place): FishingPropPlace => {
      const [x, , z] = place.position;
      return { ...place, position: [x, getGroundHeight(x, z), z] };
    });
