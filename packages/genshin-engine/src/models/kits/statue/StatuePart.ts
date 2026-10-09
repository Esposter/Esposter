import type { StatueSection } from "#src/models/kits/statue/StatueSection";

// One run of a statue's part: a radial stack standing on its foot at its position, in the statue's own frame, with its
// Axis turned about the vertical as the statue is. Its part is the export part its sections came from, which names its
// Material
export interface StatuePart {
  part: string;
  position: readonly number[];
  sections: StatueSection[];
}
