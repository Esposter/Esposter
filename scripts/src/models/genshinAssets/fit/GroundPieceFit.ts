import type { GroundPieceMeasure } from "#src/models/genshinAssets/fit/GroundPieceMeasure";
import type { GameDataBuild } from "#src/models/shared/GameDataBuild";

// A piece's fit: its key, its notes, the record it returns only when its bar holds its gate, and the samples its gate is
// Read on. The measure is absent where the piece is refused before its hills are fitted
export interface GroundPieceFit {
  build: GameDataBuild;
  isHeld: boolean;
  key: string;
  measure?: GroundPieceMeasure | undefined;
  sampleCount: number;
}
