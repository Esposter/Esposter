import type { GroundPoint } from "genshin-engine";

// A piece of a region's ground to fit: a square of samples round its centre, half its side in metres, of which the
// Samples inside `checkIsInside` are the piece's own, and the key its record is published under
export interface GroundPiece {
  centre: GroundPoint;
  checkIsInside: (x: number, z: number) => boolean;
  half: number;
  key: string;
}
