import type { MapPointPlacement } from "#src/models/genshinAssets/points/MapPointPlacement";

import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";

// A placement's places carried from the game's axes into a region's, round the world's origin the way a region's landmarks
// And residents are: x less the origin's x, and z the origin's less the place's, since a region's z runs the mirror of the
// Game's. The fit's places are in the game's axes, so a region's slice needs this before it is written
export const toRegionFramePlacement = <Kind>(
  placement: MapPointPlacement<Kind>,
  [originX, , originZ]: readonly [number, number, number],
): MapPointPlacement<Kind> => ({
  ...placement,
  places: Object.fromEntries(
    Object.entries(placement.places).map(([region, places]) => [
      region,
      places.map((place) => ({
        ...place,
        position: { x: roundFitted(place.position.x - originX), z: roundFitted(originZ - place.position.z) },
      })),
    ]),
  ),
});
