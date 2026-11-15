// What a desert ruin piece is, which decides how the kit builds it
export const DesertRuinPieceKind = {
  Colonnade: "Colonnade",
  HalfBuriedHall: "HalfBuriedHall",
  Obelisk: "Obelisk",
  SteppedPyramid: "SteppedPyramid",
} as const;
export type DesertRuinPieceKind = (typeof DesertRuinPieceKind)[keyof typeof DesertRuinPieceKind];
