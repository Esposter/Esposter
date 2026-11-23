import type { InteractiveMapPoint } from "#src/models/genshinAssets/points/InteractiveMapPoint";
import type { SimilarityTransform } from "#src/models/genshinAssets/points/SimilarityTransform";
import type { SceneTransportPoint } from "#src/models/genshinAssets/world/SceneTransportPoint";
import type { GroundPoint } from "genshin-engine";
import type { LandmarkKind, StatueOfTheNewMoonLandmark, WaypointLandmark } from "genshin-world";

import { findAreaId } from "#src/services/genshinAssets/fit/findAreaId";
import { GROUND_LAYER, INTERACTIVE_MAP_FIT_BAR } from "#src/services/genshinAssets/points/constants";
import { matchPairs } from "#src/services/genshinAssets/points/matchPairs";
import { toLandmarkArrival } from "#src/services/genshinAssets/shared/toLandmarkArrival";

// The landmarks of one kind the official map labels on the ground, each paired with a transport point of the scene
// Within The fit's bar and placed at that point's arrival: its place and turn carried round the origin as the region's
// Other places Are, its id the region, the kind's word and the point's own id, which the first-unlock rewards are keyed
// By too. A map Point of another label or on an underground layer, and a transport point no label pairs with, give none
export const toPairedLandmarks = ({
  areas,
  getWorldHeight,
  idWord,
  kind,
  labelId,
  mapPoints,
  origin,
  region,
  transform,
  transportPoints,
}: {
  areas: readonly { id: string; outline: readonly GroundPoint[] }[];
  getWorldHeight: (x: number, z: number) => number;
  idWord: string;
  kind: typeof LandmarkKind.StatueOfTheNewMoon | typeof LandmarkKind.TeleportWaypoint;
  labelId: number;
  mapPoints: readonly InteractiveMapPoint[];
  origin: readonly [number, number, number];
  region: string;
  transform: SimilarityTransform;
  transportPoints: readonly SceneTransportPoint[];
}): (StatueOfTheNewMoonLandmark | WaypointLandmark)[] => {
  const labelled = mapPoints.filter(({ label_id, z_level }) => label_id === labelId && z_level === GROUND_LAYER);
  const pairedIndexes = new Set(
    matchPairs(
      labelled.map(({ x_pos, y_pos }) => ({ x: x_pos, z: y_pos })),
      transportPoints.map(({ position }) => position),
      transform,
      INTERACTIVE_MAP_FIT_BAR,
    ).map(({ toIndex }) => toIndex),
  );
  return transportPoints
    .filter((_value, index) => pairedIndexes.has(index))
    .map((point) => {
      const arrival = toLandmarkArrival(point, origin, getWorldHeight);
      return {
        areaId: findAreaId(areas, arrival.position),
        arrival,
        heightOffset: arrival.heightOffset,
        id: `${region}-${idWord}-${point.id}`,
        kind,
        position: arrival.position,
        rotation: arrival.rotation,
      };
    });
};
