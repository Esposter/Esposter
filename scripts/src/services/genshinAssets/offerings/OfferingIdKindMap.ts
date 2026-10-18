import { OfferingKind } from "#src/models/genshinAssets/offerings/OfferingKind";

// The kind of each offering id the dump's level-up table names, by the id its open state gives it. Each id's levels are
// Published under its kind, and an id this map does not hold is an error. Ids 1 to 3, 5 to 9, 16 and 19 are the offerings
// The wiki's Offering System page names, their group sizes and totals matching its figures; the rest are the game's own
export const OfferingIdKindMap: Partial<Record<number, OfferingKind>> = {
  1: OfferingKind.FrostbearingTree,
  2: OfferingKind.SacredSakura,
  3: OfferingKind.LumenstoneAdjuvant,
  5: OfferingKind.TreeOfDreams,
  6: OfferingKind.AmritaPool,
  7: OfferingKind.FountainOfLucine,
  8: OfferingKind.VotiveRainjade,
  9: OfferingKind.TonaFlame,
  10: OfferingKind.NordkalaiOffering01,
  11: OfferingKind.NordkalaiOffering02,
  12: OfferingKind.NordkalaiOffering03,
  13: OfferingKind.NordkalaiOffering04,
  14: OfferingKind.NordkalaiOffering05,
  15: OfferingKind.NordkalaiOffering06,
  16: OfferingKind.MemoryCore,
  17: OfferingKind.NordkalaiOffering07,
  18: OfferingKind.NordkalaiOffering08,
  19: OfferingKind.ShadowRealmAnalyzer,
  20: OfferingKind.SnezhnayaOffering01,
  21: OfferingKind.SnezhnayaOffering02,
  22: OfferingKind.SnezhnayaOffering03,
};
