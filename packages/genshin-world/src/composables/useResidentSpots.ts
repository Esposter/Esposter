import type { RegionData } from "#src/models/world/RegionData";
import type { ResidentSpot } from "#src/models/world/ResidentSpot";
import type { GameClock } from "genshin-engine";

import { computeResidentSpot } from "#src/services/resident/computeResidentSpot";
import { computeShownResidentSpot } from "#src/services/resident/computeShownResidentSpot";
import { useLoop, useTres } from "@tresjs/core";
import { Frustum, Matrix4, Vector3 } from "three";
import { shallowRef } from "vue";

// Where each resident of the regions in reach stands at the clock's minute, a change of spot held while the resident is
// In view. Read each frame from the clock and the camera, so an hour passing moves them with no watch, and the map is
// Replaced only when a resident's spot has changed. A resident is placed the first frame they are in the data, and one
// Whose region leaves reach is dropped, so coming back into reach places them afresh
export const useResidentSpots = (
  regionDataMap: ReadonlyMap<string, RegionData>,
  gameClock: GameClock,
  origin: Vector3,
  getGroundHeight: (x: number, z: number) => number,
) => {
  const { camera } = useTres();
  const { onBeforeRender } = useLoop();
  const frustum = new Frustum();
  const originMatrix = new Matrix4();
  const viewProjection = new Matrix4();
  const point = new Vector3();
  const shownSpots = new Map<string, ResidentSpot | undefined>();
  const visitedIds = new Set<string>();
  const residentSpots = shallowRef<ReadonlyMap<string, ResidentSpot>>(new Map());
  // A spot's ground height is fixed by its place, so it is read once per spot rather than every frame it is tested
  const groundHeightMap = new WeakMap<ResidentSpot, number>();
  // The frustum is in world coordinates, as the terrain's is, so a resident's ground point is tested where it stands
  const checkIsInView = (spot: ResidentSpot): boolean => {
    const { x, z } = spot.position;
    let height = groundHeightMap.get(spot);
    if (height === undefined) {
      height = getGroundHeight(x, z);
      groundHeightMap.set(spot, height);
    }
    point.set(x, height, z);
    return frustum.containsPoint(point);
  };

  onBeforeRender(() => {
    const activeCamera = camera.value;
    if (!activeCamera) return;
    activeCamera.updateMatrixWorld();
    originMatrix.makeTranslation(-origin.x, -origin.y, -origin.z);
    viewProjection
      .multiplyMatrices(activeCamera.projectionMatrix, activeCamera.matrixWorldInverse)
      .multiply(originMatrix);
    frustum.setFromProjectionMatrix(viewProjection, activeCamera.coordinateSystem);
    let isChanged = false;
    visitedIds.clear();
    for (const { residents } of regionDataMap.values())
      for (const resident of residents) {
        const { id } = resident;
        const targetSpot = computeResidentSpot(resident, gameClock.minutes);
        visitedIds.add(id);
        if (!shownSpots.has(id)) {
          shownSpots.set(id, targetSpot);
          isChanged = true;
          continue;
        }
        const shownSpot = shownSpots.get(id);
        // The spot a change would leave, or the one it would appear at, is the one whose view holds it back
        const viewedSpot = shownSpot ?? targetSpot;
        const isInView = viewedSpot !== undefined && checkIsInView(viewedSpot);
        const nextSpot = computeShownResidentSpot(shownSpot, targetSpot, isInView);
        if (nextSpot === shownSpot) continue;
        shownSpots.set(id, nextSpot);
        isChanged = true;
      }
    for (const id of shownSpots.keys())
      if (!visitedIds.has(id)) {
        shownSpots.delete(id);
        isChanged = true;
      }
    if (!isChanged) return;
    const spots = new Map<string, ResidentSpot>();
    for (const [id, spot] of shownSpots) if (spot) spots.set(id, spot);
    residentSpots.value = spots;
  });

  return { residentSpots };
};
