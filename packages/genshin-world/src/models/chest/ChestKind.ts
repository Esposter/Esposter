// The chests the official map marks by tier, from Common to Remarkable, and the two places it marks with no tier of
// Their own: a Buried chest, dug up where it stands, and a Sealed chest, freed of its seal first. The map names no tier
// For either, so what a dug or freed one holds is not yet settled. The two Mora chests, a wooden one and a stone pile,
// Are marked by labels of their own and carry no tier either
export const ChestKind = {
  Buried: "Buried",
  Common: "Common",
  Exquisite: "Exquisite",
  Luxurious: "Luxurious",
  Precious: "Precious",
  Remarkable: "Remarkable",
  Sealed: "Sealed",
  StonePileMora: "StonePileMora",
  WoodenMora: "WoodenMora",
} as const;
export type ChestKind = (typeof ChestKind)[keyof typeof ChestKind];
export const ChestKinds: readonly ChestKind[] = Object.values(ChestKind);
