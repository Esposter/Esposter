// The chests the official map marks by tier, from Common to Remarkable, and the two places it marks with no tier of their
// Own: a Buried chest, dug up where it stands, and a Sealed chest, freed of its seal first. The map names no tier for
// Either, so what a dug or freed one holds is not yet settled
export const ChestKind = {
  Buried: "Buried",
  Common: "Common",
  Exquisite: "Exquisite",
  Luxurious: "Luxurious",
  Precious: "Precious",
  Remarkable: "Remarkable",
  Sealed: "Sealed",
} as const;
export type ChestKind = (typeof ChestKind)[keyof typeof ChestKind];
