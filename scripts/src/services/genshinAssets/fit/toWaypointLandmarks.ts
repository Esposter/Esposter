import type { InteractiveMapPoint } from "#src/models/genshinAssets/points/InteractiveMapPoint";
import type { SimilarityTransform } from "#src/models/genshinAssets/points/SimilarityTransform";
import type { SceneTransportPoint } from "#src/models/genshinAssets/world/SceneTransportPoint";
import type { GroundPoint } from "genshin-engine";
import type { WaypointLandmark } from "genshin-world";

import {
  GROUND_LAYER,
  INTERACTIVE_MAP_FIT_BAR,
  INTERACTIVE_MAP_WAYPOINT_LABEL_ID,
} from "#src/services/genshinAssets/points/constants";
import { matchPairs } from "#src/services/genshinAssets/points/matchPairs";
import { toLandmarkArrival } from "#src/services/genshinAssets/shared/toLandmarkArrival";
import { computeOutlineDistance } from "genshin-engine";
import { LandmarkKind } from "genshin-world";

// The id of the catalogue area whose outline holds a place in its region, or "" where no outline does
const findAreaId = (areas: readonly { id: string; outline: readonly GroundPoint[] }[], position: GroundPoint): string =>
  areas.find(({ outline }) => computeOutlineDistance(outline, position.x, position.z) === 0)?.id ?? "";

// The waypoints of a region as landmarks of their own kind. A ground waypoint on the official map is a waypoint where it
// Pairs with a transport point of the scene within the fit's bar, and each such point is placed as the landmark's arrival,
// Its place and turn carried round the origin as the region's other places are. Its id is its region and the point's own
// Id, which the first-unlock rewards are keyed by too. A map point that is no ground waypoint, and a transport point no
// Waypoint pairs with, give none
export const toWaypointLandmarks = ({
  areas,
  getWorldHeight,
  mapPoints,
  origin,
  region,
  transform,
  transportPoints,
}: {
  areas: readonly { id: string; outline: readonly GroundPoint[] }[];
  getWorldHeight: (x: number, z: number) => number;
  mapPoints: readonly InteractiveMapPoint[];
  origin: readonly [number, number, number];
  region: string;
  transform: SimilarityTransform;
  transportPoints: readonly SceneTransportPoint[];
}): WaypointLandmark[] => {
  const waypoints = mapPoints.filter(
    ({ label_id, z_level }) => label_id === INTERACTIVE_MAP_WAYPOINT_LABEL_ID && z_level === GROUND_LAYER,
  );
  const pairedIndexes = new Set(
    matchPairs(
      waypoints.map(({ x_pos, y_pos }) => ({ x: x_pos, z: y_pos })),
      transportPoints.map(({ position }) => position),
      transform,
      INTERACTIVE_MAP_FIT_BAR,
    ).map(({ toIndex }) => toIndex),
  );
  return transportPoints
    .filter((_, index) => pairedIndexes.has(index))
    .map((point) => {
      const arrival = toLandmarkArrival(point, origin, getWorldHeight);
      return {
        areaId: findAreaId(areas, arrival.position),
        arrival,
        heightOffset: arrival.heightOffset,
        id: `${region}-waypoint-${point.id}`,
        kind: LandmarkKind.TeleportWaypoint,
        position: arrival.position,
        rotation: arrival.rotation,
      };
    });
};
