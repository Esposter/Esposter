import type { GroundPieceFit } from "#src/models/genshinAssets/fit/GroundPieceFit";
import type { GameDataBuild } from "#src/models/shared/GameDataBuild";

export interface GroundPiecesFit {
  build: GameDataBuild;
  // The fits whose records publish: the piece itself, or the quarters and joined groups that hold
  held: GroundPieceFit[];
  // Whether some part of the piece is left unfitted: the piece itself when it cannot split, or a quarter that no group it
  // Can join holds, refused in turn
  isRefused: boolean;
}
