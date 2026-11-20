import type { Direction } from "#src/models/Direction";
import type { Position } from "#src/models/Position";

// The payloads an engine emits, each naming the character by its id and the direction it faces or moves in, so a
// Listener never reads the engine back
export interface GridEngineEvents {
  directionChanged: { direction: Direction; id: string };
  positionChangeFinished: { direction: Direction; enterTile: Position; exitTile: Position; id: string };
}
