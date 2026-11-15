// The birds and beasts of Mondstadt the official map marks as dropping when struck: the red fox, the squirrel and the
// White pigeon, which flee, and the boar, which charges at a character in its way instead. Each kind's places the map
// Gives by its label
export const WildlifeKind = {
  Boar: "Boar",
  CrimsonFox: "CrimsonFox",
  Squirrel: "Squirrel",
  WhitePigeon: "WhitePigeon",
} as const;
export type WildlifeKind = (typeof WildlifeKind)[keyof typeof WildlifeKind];
