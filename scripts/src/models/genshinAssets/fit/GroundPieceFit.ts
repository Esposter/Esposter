import type { GameDataBuild } from "#src/models/gameData/GameDataBuild";

// A piece's fit: its notes, the record it returns only when its bar holds its gate, and the samples its gate is read on
export interface GroundPieceFit {
  build: GameDataBuild;
  isHeld: boolean;
  sampleCount: number;
}
