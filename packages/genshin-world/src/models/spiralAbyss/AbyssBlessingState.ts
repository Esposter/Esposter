import type { GroundPoint } from "genshin-engine";

// What a chamber's period blessing has done in its arena: the shockwaves its modules fired, each at the position it fired from,
// And the seconds the next one may fire from
export interface AbyssBlessingState {
  shockwavePositions: GroundPoint[];
  stardreadReadySeconds: number;
}
