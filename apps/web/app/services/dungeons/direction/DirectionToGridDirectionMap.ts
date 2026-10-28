import { Direction } from "#shared/models/dungeons/data/player/Direction";
import { Direction as GridDirection } from "grid-engine";

export const DirectionToGridDirectionMap = {
  [Direction.DOWN]: GridDirection.DOWN,
  [Direction.DOWN_LEFT]: GridDirection.DOWN_LEFT,
  [Direction.DOWN_RIGHT]: GridDirection.DOWN_RIGHT,
  [Direction.LEFT]: GridDirection.LEFT,
  [Direction.NONE]: GridDirection.NONE,
  [Direction.RIGHT]: GridDirection.RIGHT,
  [Direction.UP]: GridDirection.UP,
  [Direction.UP_LEFT]: GridDirection.UP_LEFT,
  [Direction.UP_RIGHT]: GridDirection.UP_RIGHT,
} as const satisfies Record<Direction, GridDirection>;
