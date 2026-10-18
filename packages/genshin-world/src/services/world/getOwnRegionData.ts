import type { SceneExport } from "#src/models/scene/SceneExport";
import type { LoadedRegion } from "#src/models/world/LoadedRegion";

// The regions in reach the world draws its own rivers and falls for: one whose game export stands in draws those itself,
// So its region data's are left out
export const getOwnRegionData = (
  regionDataMap: ReadonlyMap<string, LoadedRegion>,
  sceneExportMap: ReadonlyMap<string, SceneExport>,
): LoadedRegion[] => [...regionDataMap].flatMap(([regionId, region]) => (sceneExportMap.has(regionId) ? [] : [region]));
