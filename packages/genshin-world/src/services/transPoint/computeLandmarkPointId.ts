import { LandmarkIdStatuePointIdMap } from "#src/services/statue/LandmarkIdStatuePointIdMap";

// The open world's scene point a landmark's first unlock is keyed by: a Statue of The Seven's by its map, and a Teleport
// Waypoint's by the point its id ends in, since the fit names each waypoint by its region and that point. A domain's
// Entrance has none, so its first unlock pays nothing
export const computeLandmarkPointId = (landmarkId: string): number | undefined => {
  const statuePointId = LandmarkIdStatuePointIdMap[landmarkId];
  if (statuePointId !== undefined) return statuePointId;
  const waypointPointId = /-waypoint-(?<pointId>\d+)$/u.exec(landmarkId)?.groups?.pointId;
  return waypointPointId === undefined ? undefined : Number(waypointPointId);
};
