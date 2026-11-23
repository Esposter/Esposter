import type { GroundPieceSample } from "#src/models/genshinAssets/fit/GroundPieceSample";
import type { RegionGround } from "genshin-world";

// What a piece's bar is read on, kept with its record so the region's composed bar reads the same samples the piece's
// Own bar did
export interface GroundPieceMeasure {
  gate: number;
  ground: RegionGround;
  samples: GroundPieceSample[];
}
