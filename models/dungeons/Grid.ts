import { exhaustiveGuard } from "@/util/exhaustiveGuard";
import { Direction } from "grid-engine";

export class Grid<TEnum extends string> {
  grid: TEnum[][];
  size: number;
  position: [number, number];

  constructor(grid: TEnum[][], size: number, position: [number, number] = [0, 0]) {
    this.grid = grid;
    this.size = size;
    this.position = position;
  }

  get value() {
    return this.grid[this.position[1]][this.position[0]];
  }

  // This is the array index if the grid were to be flattened
  // going from top-left to bottom-right
  get index() {
    return this.position[1] * this.size + this.position[0];
  }

  move(direction: Direction) {
    switch (direction) {
      case Direction.UP:
        if (this.position[1] > 0) this.position[1] -= 1;
        return;
      case Direction.DOWN:
        if (this.position[1] < this.size - 1) this.position[1] += 1;
        return;
      case Direction.LEFT:
        if (this.position[0] > 0) this.position[0] -= 1;
        return;
      case Direction.RIGHT:
        if (this.position[0] < this.size - 1) this.position[0] += 1;
        return;
      case Direction.UP_LEFT:
      case Direction.UP_RIGHT:
      case Direction.DOWN_LEFT:
      case Direction.DOWN_RIGHT:
      case Direction.NONE:
        return;
      default:
        exhaustiveGuard(direction);
    }
  }
}
