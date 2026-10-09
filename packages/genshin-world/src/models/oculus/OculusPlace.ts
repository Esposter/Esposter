import type { OculusKind } from "#src/models/oculus/OculusKind";
import type { GroundPoint } from "genshin-engine";

// An Oculus's place in the world, as the fit writes it into its region's generated slice: an id the map's point gives it,
// Its kind, and the ground point it stands at. Its height is the ground's own at that point, read when it is placed
export interface OculusPlace {
  id: string;
  kind: OculusKind;
  position: GroundPoint;
}
