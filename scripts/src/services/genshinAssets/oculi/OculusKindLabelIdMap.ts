import type { OculusKind } from "genshin-world";

// The official map's label id of each Oculus kind, from its label tree as the points were read. Each region's Oculi carry
// One label between them, so a region's count is the points of its area under its kind's label
export const OculusKindLabelIdMap: Record<OculusKind, number> = {
  Anemoculus: 5,
  Cryoculus: 833,
  Dendroculus: 403,
  Electroculus: 194,
  Geoculus: 6,
  Hydroculus: 508,
  Lunoculus: 694,
  Pyroculus: 626,
};
