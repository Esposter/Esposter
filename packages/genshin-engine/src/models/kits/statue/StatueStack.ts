import type { StatueSection } from "#src/models/kits/statue/StatueSection";

// One radial stack of a statue: standing on its foot at its position, in the statue's own frame, its axis turned from
// The vertical by its rotation (a quaternion, x, y, z then w), so a column stands upright and a wing's blade lies along
// Its own length
export interface StatueStack {
  position: readonly number[];
  rotation: readonly number[];
  sections: StatueSection[];
}
