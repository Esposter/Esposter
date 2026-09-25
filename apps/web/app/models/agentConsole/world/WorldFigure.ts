import type { Vector3Tuple } from "three";

// One agent in the room: the main one, or a subagent under the id of the call that started it
export interface WorldFigure {
  id: string;
  isMain: boolean;
  position: Vector3Tuple;
}
