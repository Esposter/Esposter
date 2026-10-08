import type { InteractiveMapRegion } from "#src/models/genshinAssets/points/InteractiveMapRegion";

// Each region's place on the official map: the map's area it lies in and its Oculi by label, with the wiki's count. Area
// 1 holds Mondstadt's sixty-six Anemoculi, and the other areas are named by the element they hold. The wiki gives
// Fontaine's, Natlan's and Nod-Krai's Oculi each as 271, the figure its Sumeru line gives too, so a shortfall there
// Is the wiki's to settle, not a fit's
export const InteractiveMapRegionMap: Record<string, InteractiveMapRegion> = {
  fontaine: { areaId: 8, oculus: { count: 271, labelId: 508 } },
  inazuma: { areaId: 3, oculus: { count: 181, labelId: 194 } },
  liyue: { areaId: 2, oculus: { count: 131, labelId: 6 } },
  mondstadt: { areaId: 1, oculus: { count: 66, labelId: 5 } },
  natlan: { areaId: 11, oculus: { count: 271, labelId: 626 } },
  "nod-krai": { areaId: 13, oculus: { count: 271, labelId: 694 } },
  snezhnaya: { areaId: 16, oculus: { count: 140, labelId: 833 } },
  sumeru: { areaId: 4, oculus: { count: 271, labelId: 403 } },
};
