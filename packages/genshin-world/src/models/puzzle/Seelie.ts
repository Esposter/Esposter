import type { SeelieState } from "#src/models/puzzle/SeelieState";
import type { GroundPoint } from "genshin-engine";

// A Seelie led from where it rests to its court along a route on the ground. Its id is the place the map gives its Seelie,
// Which a save names it by once it settles. Its progress runs from 0 at its start to 1 at its court, and unfollowedSeconds
// Counts the time it has been led without being followed
export interface Seelie {
  court: GroundPoint;
  id: string;
  progress: number;
  start: GroundPoint;
  state: SeelieState;
  unfollowedSeconds: number;
}
