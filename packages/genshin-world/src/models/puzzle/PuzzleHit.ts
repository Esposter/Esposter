import type { Element } from "#src/models/Element";
import type { AttackArea } from "#src/models/kit/AttackArea";

// A hit a puzzle takes from a hit a step landed: the cylinder it reaches, and the element and gauge it strikes with. A
// Hit with no gauge carries no element, so a puzzle takes none from it
export interface PuzzleHit {
  element?: Element;
  gauge: number;
  hitArea: AttackArea;
}
