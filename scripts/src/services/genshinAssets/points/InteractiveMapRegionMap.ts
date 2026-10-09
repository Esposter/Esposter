import type { InteractiveMapRegion } from "#src/models/genshinAssets/points/InteractiveMapRegion";

import { OculusKind } from "genshin-world";

// Each region's place on the official map: the map's area it lies in and its Oculi by label, with the wiki's count. Area
// 1 holds Mondstadt's sixty-six Anemoculi, and the other areas are named by the element they hold. The wiki gives
// Fontaine's, Natlan's and Nod-Krai's Oculi each as 271, the figure its Sumeru line gives too, so a shortfall there
// Is the wiki's to settle, not a fit's
export const InteractiveMapRegionMap: Record<string, InteractiveMapRegion> = {
  fontaine: { areaId: 8, oculus: { count: 271, kind: OculusKind.Hydroculus } },
  inazuma: { areaId: 3, oculus: { count: 181, kind: OculusKind.Electroculus } },
  liyue: { areaId: 2, oculus: { count: 131, kind: OculusKind.Geoculus } },
  mondstadt: { areaId: 1, oculus: { count: 66, kind: OculusKind.Anemoculus } },
  natlan: { areaId: 11, oculus: { count: 271, kind: OculusKind.Pyroculus } },
  "nod-krai": { areaId: 13, oculus: { count: 271, kind: OculusKind.Lunoculus } },
  snezhnaya: { areaId: 16, oculus: { count: 140, kind: OculusKind.Cryoculus } },
  sumeru: { areaId: 4, oculus: { count: 271, kind: OculusKind.Dendroculus } },
};
