import { exhaustiveGuard } from "@/util/exhaustiveGuard";
import type { Position } from "grid-engine";
import { Direction } from "grid-engine";

export class Grid<TValue, TGrid extends ReadonlyArray<ReadonlyArray<TValue>>> {
  grid: TGrid;
  position: Position;

  constructor(grid: TGrid, position: Position = { x: 0, y: 0 }) {
    this.grid = grid;
    this.position = position;
  }

  get value() {
    return this.grid[this.position.y][this.position.x];
  }

  getValue({ x, y }: Position) {
    if (x > this.getColumnSize(y)) throw new Error(`Invalid position: { x: ${x}, y: ${y} }`);
    return this.grid[y][x];
  }

  get rowSize() {
    return this.grid.length;
  }

  getColumnSize(rowIndex: number) {
    if (rowIndex > this.rowSize - 1) throw new Error(`Invalid row index: ${rowIndex}`);
    return this.grid[rowIndex].length;
  }

  move(direction: Direction) {
    switch (direction) {
      case Direction.UP:
        if (this.position.y > 0) this.position.y -= 1;
        return;
      case Direction.DOWN:
        if (this.position.y < this.rowSize - 1) this.position.y += 1;
        return;
      case Direction.LEFT:
        if (this.position.x > 0) this.position.x -= 1;
        return;
      case Direction.RIGHT:
        if (this.position.x < this.getColumnSize(this.position.y) - 1) this.position.x += 1;
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
