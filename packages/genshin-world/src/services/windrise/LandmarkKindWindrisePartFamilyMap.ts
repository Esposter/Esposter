import { WindrisePartFamily } from "#src/models/windrise/WindrisePartFamily";
import { LandmarkKind } from "#src/models/world/LandmarkKind";

// The witness family each kind of landmark in Windrise stands for: its trees are the oak and its statues the statue. Each
// Is marked with its family, so a witness render draws ours of that family in place of the exports'
export const LandmarkKindWindrisePartFamilyMap: Partial<Record<LandmarkKind, WindrisePartFamily>> = {
  [LandmarkKind.StatueOfTheSeven]: WindrisePartFamily.Statue,
  [LandmarkKind.Tree]: WindrisePartFamily.Oak,
};
