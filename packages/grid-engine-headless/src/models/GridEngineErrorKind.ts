// Why a call failed: an unknown character, a position off the grid, a diagonal move, a grid with no rectangle of tiles,
// Or a speed that is not a positive number
export const GridEngineErrorKind = {
  DiagonalMove: "diagonal-move",
  InvalidGrid: "invalid-grid",
  InvalidSpeed: "invalid-speed",
  OutsideGrid: "outside-grid",
  UnknownCharacter: "unknown-character",
} as const;
export type GridEngineErrorKind = (typeof GridEngineErrorKind)[keyof typeof GridEngineErrorKind];
