import type { MonumentPuzzle } from "#src/models/puzzle/MonumentPuzzle";

import { checkIsMonumentPuzzleSolved } from "#src/services/puzzle/checkIsMonumentPuzzleSolved";

// A monument puzzle moved on the fixed step: solved once every one of its monuments is lit together, and kept solved
// After that, so a monument going out later leaves it solved
export const stepMonumentPuzzle = (puzzle: MonumentPuzzle): void => {
  if (checkIsMonumentPuzzleSolved(puzzle.monuments)) puzzle.isSolved = true;
};
