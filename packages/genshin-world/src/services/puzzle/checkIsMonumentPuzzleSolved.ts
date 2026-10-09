import type { ElementalMonument } from "#src/models/puzzle/ElementalMonument";

// A puzzle of monuments is solved once every one of its monuments is lit together, and never by none at all
export const checkIsMonumentPuzzleSolved = (monuments: ElementalMonument[]): boolean =>
  monuments.length > 0 && monuments.every(({ isLit }) => isLit);
