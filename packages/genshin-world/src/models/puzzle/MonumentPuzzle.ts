import type { ElementalMonument } from "#src/models/puzzle/ElementalMonument";

// A puzzle of Elemental Monuments, solved once every one of them is lit together. Its solved flag is set once and never
// Cleared, so a puzzle solved stays solved however its monuments go out afterward
export interface MonumentPuzzle {
  isSolved: boolean;
  monuments: ElementalMonument[];
}
