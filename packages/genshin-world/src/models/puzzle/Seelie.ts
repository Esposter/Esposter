import type { SeelieState } from "#src/models/puzzle/SeelieState";
import type { GroundPoint } from "genshin-engine";

// A Seelie led from where it rests to its court along a route on the ground. Its progress runs from 0 at its start to 1
// At its court, and unfollowedSeconds counts the time it has been led without being followed
export interface Seelie {
  court: GroundPoint;
  progress: number;
  start: GroundPoint;
  state: SeelieState;
  unfollowedSeconds: number;
}
