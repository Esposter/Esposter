import type { InteractiveMapRegionFit } from "#src/models/genshinAssets/points/InteractiveMapRegionFit";

import { INTERACTIVE_MAP_FIT_BAR } from "#src/services/genshinAssets/points/constants";

// The regions of the list whose map fit passes its bar. A region none of whose points matched has no residual, so it
// Passes nothing, and a region over the bar is not the scene's, so its places are not written
export const selectFittedRegions = (
  regionFits: readonly InteractiveMapRegionFit[],
  regions: readonly string[],
): string[] =>
  regions.filter((region) => {
    const residual = regionFits.find((regionFit) => regionFit.region === region)?.residual;
    return residual !== undefined && residual <= INTERACTIVE_MAP_FIT_BAR;
  });
