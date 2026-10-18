import type { MonumentPuzzle } from "#src/models/puzzle/MonumentPuzzle";
import type { GroundPoint } from "genshin-engine";

// An Elemental Monument's mark in the world: the puzzle of its one monument, its id and the ground point it stands at
export interface MonumentMarker {
  id: string;
  position: GroundPoint;
  puzzle: MonumentPuzzle;
}
