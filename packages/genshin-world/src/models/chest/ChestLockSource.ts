import type { GroundPoint } from "genshin-engine";

// A camp or a puzzle that locks the chests within its reach: the ground points it stands at, and whether it is done, a
// Camp cleared once every enemy of it is defeated and a puzzle once it is solved
export interface ChestLockSource {
  isDone: boolean;
  positions: GroundPoint[];
}
