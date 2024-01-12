import { exhaustiveGuard } from "@/util/exhaustiveGuard";
import { mod } from "@/util/math/mod";
import { Direction } from "grid-engine";

export class Grid<TEnum extends string> {
  grid: TEnum[][];
  position: [number, number];
  size: number;

  constructor(grid: TEnum[][], position: [number, number] = [0, 0], size: number) {
    this.grid = grid;
    this.position = position;
    this.size = size;
  }

  get value() {
    return this.grid[this.position[1]][this.position[0]];
  }

  move(direction: Direction) {
    switch (direction) {
      case Direction.UP:
        this.position[1] = (this.position[1] + 1) % this.size;
        return;
      case Direction.DOWN:
        this.position[1] = mod(this.position[1] + 1, this.size);
        return;
      case Direction.LEFT:
        this.position[0] = mod(this.position[0] - 1, this.size);
        return;
      case Direction.RIGHT:
        this.position[0] = (this.position[0] + 1) % this.size;
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
