import type { GameDataBuild } from "#src/models/shared/GameDataBuild";

export interface GroundPiecesFit {
  build: GameDataBuild;
  // Whether some part of the piece is left unfitted: the piece itself when it cannot split, or a quarter refused in turn
  isRefused: boolean;
}
