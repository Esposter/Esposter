import type { HomePlacement } from "#src/models/home/HomePlacement";

// The placements in one area: those whose area id and scene id name it, in the order they were placed
export const getHomeAreaPlacements = (
  placements: HomePlacement[],
  { areaId, sceneId }: Pick<HomePlacement, "areaId" | "sceneId">,
): HomePlacement[] => placements.filter((placement) => placement.areaId === areaId && placement.sceneId === sceneId);
