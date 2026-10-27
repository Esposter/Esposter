import { OculusKind } from "genshin-world";

// The official map's label id of each Oculus kind, from its label tree as the points were read. Each region's Oculi carry
// One label between them, so a region's count is the points of its area under its kind's label
export const OculusKindLabelIdMap: Record<OculusKind, number> = {
  [OculusKind.Anemoculus]: 5,
  [OculusKind.Cryoculus]: 833,
  [OculusKind.Dendroculus]: 403,
  [OculusKind.Electroculus]: 194,
  [OculusKind.Geoculus]: 6,
  [OculusKind.Hydroculus]: 508,
  [OculusKind.Lunoculus]: 694,
  [OculusKind.Pyroculus]: 626,
};
