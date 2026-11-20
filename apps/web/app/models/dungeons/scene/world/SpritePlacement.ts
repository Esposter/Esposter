import type { Direction, Position } from "grid-engine-headless";

// Where a sprite is drawn: its tile and the step under way, the tile's and the sprite's pixel sizes, and the offset
// The sprite's configuration adds. Progress is a share of a step, from zero to a thousand
export interface SpritePlacement {
  customOffset: Position;
  displayHeight: number;
  displayWidth: number;
  facing: Direction;
  position: Position;
  progress: number;
  tileHeight: number;
  tileWidth: number;
}
