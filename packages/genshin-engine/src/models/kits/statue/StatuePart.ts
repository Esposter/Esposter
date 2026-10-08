import type { LatheSection } from "#src/models/kits/architecture/LatheSection";

// One part of a statue: a lathe stack standing on its foot at its position, in the statue's own frame, with its axis
// Turned about the vertical as the statue is
export interface StatuePart {
  position: readonly number[];
  sections: LatheSection[];
}
