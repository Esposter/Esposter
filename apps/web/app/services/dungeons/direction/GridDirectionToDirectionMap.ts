import { Direction } from "#shared/models/dungeons/data/player/Direction";
import { Direction as GridDirection } from "grid-engine";

export const GridDirectionToDirectionMap = {
  [GridDirection.DOWN]: Direction.DOWN,
  [GridDirection.DOWN_LEFT]: Direction.DOWN_LEFT,
  [GridDirection.DOWN_RIGHT]: Direction.DOWN_RIGHT,
  [GridDirection.LEFT]: Direction.LEFT,
  [GridDirection.NONE]: Direction.NONE,
  [GridDirection.RIGHT]: Direction.RIGHT,
  [GridDirection.UP]: Direction.UP,
  [GridDirection.UP_LEFT]: Direction.UP_LEFT,
  [GridDirection.UP_RIGHT]: Direction.UP_RIGHT,
} as const satisfies Record<GridDirection, Direction>;
