import type { GroundPoint } from "genshin-engine";

// The square a ground piece is fitted over: its centre and half its side in metres
export interface GroundPieceSquare {
  centre: GroundPoint;
  half: number;
}
