import type { Direction } from "#shared/models/dungeons/data/player/Direction";
import type { Position } from "grid-engine";

export interface InitialMetadata {
  direction: Direction;
  position: Position;
}
