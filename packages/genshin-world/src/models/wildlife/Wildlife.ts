import type { WildlifeKind } from "#src/models/wildlife/WildlifeKind";
import type { WildlifeState } from "#src/models/wildlife/WildlifeState";
import type { GroundPoint } from "genshin-engine";

// One animal in the world as its flight moves it, written in place each step: its kind, where it was placed and where it
// Stands, which way it faces in radians about the vertical from south, its state and how long it has held it
export interface Wildlife {
  heading: number;
  home: GroundPoint;
  id: string;
  kind: WildlifeKind;
  position: GroundPoint;
  state: WildlifeState;
  stateSeconds: number;
}
