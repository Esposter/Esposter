import { OfferingKind } from "genshin-world/definitions";

// The official map's label id of each offering that stands on it, from its label tree as the points were read.
// Each comes with the map's name for it.
// The Throne of the Primal Fire is where the Primal Flame Resonance stands.
// The label Tonatiuh is taken as the Tablet of Tona, both by name and area and not yet measured.
// The Frostbearing Tree's label is not here, since its place is published in its own dataset.
export const LabelIdOfferingKindMap: ReadonlyMap<number, OfferingKind> = new Map([
  [316, OfferingKind.SacredSakura],
  [414, OfferingKind.TreeOfDreams],
  [467, OfferingKind.AmritaPool],
  [658, OfferingKind.TonaFlame],
  [662, OfferingKind.PrimalFlameResonance],
]);
