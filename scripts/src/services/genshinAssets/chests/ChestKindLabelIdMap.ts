import type { ChestKind } from "genshin-world";

// The official map's label id of each chest kind, from its label tree as the points were read. A tier's label marks the
// Chest of that tier, and Buried and Sealed mark the places a tier does not
export const ChestKindLabelIdMap: Record<ChestKind, number> = {
  Buried: 69,
  Common: 17,
  Exquisite: 44,
  Luxurious: 46,
  Precious: 45,
  Remarkable: 269,
  Sealed: 75,
};
