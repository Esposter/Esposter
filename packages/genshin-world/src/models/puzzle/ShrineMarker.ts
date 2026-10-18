import type { ShrineOfDepths } from "#src/models/puzzle/ShrineOfDepths";
import type { GroundPoint } from "genshin-engine";

// A Shrine of Depths in the world: the shrine, shut or open, its id and the ground point it stands at
export interface ShrineMarker {
  id: string;
  position: GroundPoint;
  shrine: ShrineOfDepths;
}
