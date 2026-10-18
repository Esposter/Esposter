import type { GroundPoint } from "genshin-engine";

// What a chamber's period blessings have done in its arena: the shockwaves their modules fired, each at the position it fired
// From, and, for each blessing by its name text hash, the seconds its next shockwave may fire from
export interface AbyssBlessingState {
  blessingReadySecondsMap: ReadonlyMap<number, number>;
  shockwavePositions: GroundPoint[];
}
