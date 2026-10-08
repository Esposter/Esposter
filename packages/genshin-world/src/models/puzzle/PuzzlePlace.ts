import type { PuzzleKind } from "#src/models/puzzle/PuzzleKind";
import type { GroundPoint } from "genshin-engine";

// A puzzle's mechanism as the fit writes it into its region's generated slice: an id the map's point gives it, its kind,
// And the ground point it stands at. Its height is the ground's own at that point, read when it is placed
export interface PuzzlePlace {
  id: string;
  kind: PuzzleKind;
  position: GroundPoint;
}
