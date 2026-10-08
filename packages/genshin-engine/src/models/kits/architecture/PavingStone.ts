import type { PavingStoneShape } from "#src/models/kits/architecture/PavingStoneShape";

// A paving stone set where its transform stands: its position, its rotation as a quaternion and its scale, as the
// Components of a transform are read, so a stone's data needs no tuple types
export interface PavingStone {
  position: readonly number[];
  quaternion: readonly number[];
  scale: readonly number[];
  shape: PavingStoneShape;
}
