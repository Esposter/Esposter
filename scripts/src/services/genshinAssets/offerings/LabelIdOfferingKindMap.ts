import { OfferingKind } from "#src/models/genshinAssets/offerings/OfferingKind";

// The official map's label id of each offering that stands on it, from its label tree as the points were read, with the
// Map's name for it. The Throne of the Primal Fire is where the Primal Flame Resonance stands, and the label Tonatiuh is
// Taken as the Tablet of Tona, both by name and area and not yet measured. The Frostbearing Tree's label is not here,
// Since its place is published in its own dataset
export const LabelIdOfferingKindMap: ReadonlyMap<number, OfferingKind> = new Map([
  [316, OfferingKind.SacredSakura],
  [414, OfferingKind.TreeOfDreams],
  [467, OfferingKind.AmritaPool],
  [658, OfferingKind.TonaFlame],
  [662, OfferingKind.PrimalFlameResonance],
]);
