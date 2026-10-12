import type { ShadingRegionToggles } from "#src/models/character/ShadingRegionToggles";

import { REGION_FLOORS } from "#src/character/shading/constants";

// The region a pixel takes from its lightmap's alpha: regions two to five each need the alpha to reach their band and
// Their toggle to be set, and every other pixel is region one
export const getShadingRegion = (alpha: number, toggles: ShadingRegionToggles): number => {
  if (alpha >= REGION_FLOORS.two && toggles.two) return 2;
  if (alpha >= REGION_FLOORS.five && alpha < REGION_FLOORS.two && toggles.five) return 5;
  if (alpha >= REGION_FLOORS.three && alpha < REGION_FLOORS.five && toggles.three) return 3;
  if (alpha >= REGION_FLOORS.four && alpha < REGION_FLOORS.three && toggles.four) return 4;
  return 1;
};
