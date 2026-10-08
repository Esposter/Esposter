import type { StatueSection } from "#src/models/kits/statue/StatueSection";

// One part of a statue: a radial stack standing on its foot at its position, in the statue's own frame, with its axis
// Turned about the vertical as the statue is
export interface StatuePart {
  position: readonly number[];
  sections: StatueSection[];
}
