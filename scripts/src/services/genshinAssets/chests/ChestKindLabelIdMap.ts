import { ChestKind } from "genshin-world";

// The official map's label id of each chest kind, from its label tree as the points were read. A tier's label marks the
// Chest of that tier, and Buried and Sealed mark the places a tier does not
export const ChestKindLabelIdMap: Record<ChestKind, number> = {
  [ChestKind.Buried]: 69,
  [ChestKind.Common]: 17,
  [ChestKind.Exquisite]: 44,
  [ChestKind.Luxurious]: 46,
  [ChestKind.Precious]: 45,
  [ChestKind.Remarkable]: 269,
  [ChestKind.Sealed]: 75,
};
