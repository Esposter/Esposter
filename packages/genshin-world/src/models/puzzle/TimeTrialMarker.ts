import type { TimeTrialChallenge } from "#src/models/puzzle/TimeTrialChallenge";
import type { GroundPoint } from "genshin-engine";

// A Time Trial Challenge's marker in the world: the challenge started there, its id and the ground point it stands at
export interface TimeTrialMarker {
  challenge: TimeTrialChallenge;
  id: string;
  position: GroundPoint;
}
