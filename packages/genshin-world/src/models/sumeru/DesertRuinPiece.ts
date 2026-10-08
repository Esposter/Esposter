import type { DesertRuinPieceKind } from "#src/models/sumeru/DesertRuinPieceKind";
import type { GroundPoint } from "genshin-engine";

// A piece of a desert ruin standing at its position on the ground, in metres
export type DesertRuinPiece =
  | {
      columnCount: number;
      columnHeight: number;
      columnRadius: number;
      columnSpacing: number;
      kind: DesertRuinPieceKind.Colonnade;
      position: GroundPoint;
    }
  | { baseRadius: number; height: number; kind: DesertRuinPieceKind.Obelisk; position: GroundPoint }
  | {
      baseRadius: number;
      kind: DesertRuinPieceKind.SteppedPyramid;
      position: GroundPoint;
      stepCount: number;
      stepHeight: number;
    }
  | {
      buriedHeight: number;
      height: number;
      kind: DesertRuinPieceKind.HalfBuriedHall;
      length: number;
      position: GroundPoint;
      width: number;
    };
