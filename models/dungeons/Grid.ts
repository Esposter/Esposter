import { exhaustiveGuard } from "@/util/exhaustiveGuard";
import type { Position } from "grid-engine";
import { Direction } from "grid-engine";

export class Grid<TEnum extends string, TGrid extends TEnum[][]> {
  grid: TGrid;
  position: [number, number];

  constructor(grid: TGrid, position: [number, number] = [0, 0]) {
    this.grid = grid;
    this.position = position;
  }

  get value() {
    return this.grid[this.position[1]][this.position[0]];
  }

  getValue(index: number) {
    for (let i = 0; i < this.rowSize; i++) {
      const columnSize = this.getColumnSize(i);
      if (index < columnSize) return this.grid[i][index];
      index -= columnSize;
    }

    throw new Error("Invalid index");
  }

  // This is the array index if the grid were to be flattened
  // going from top-left to bottom-right
  get index() {
    let index = this.position[0];
    for (let i = 0; i < this.position[1]; i++) index += this.getColumnSize(i);
    return index;
  }

  set index(value: number) {
    for (let i = 0; i < this.rowSize; i++) {
      const columnSize = this.getColumnSize(i);
      if (value < columnSize) {
        this.position = [value, i];
        return;
      }
      value -= columnSize;
    }

    throw new Error("Invalid index");
  }

  getIndex({ x, y }: Position) {
    if (x > this.getColumnSize(y)) throw new Error("Invalid position");

    let index = 0;
    for (let i = 0; i < y; i++) index += this.getColumnSize(i);
    return index + x;
  }

  get rowSize() {
    return this.grid.length;
  }

  getColumnSize(rowIndex: number) {
    if (rowIndex > this.rowSize - 1) throw new Error("Invalid row index");

    return this.grid[rowIndex].length;
  }

  move(direction: Direction) {
    switch (direction) {
      case Direction.UP:
        if (this.position[1] > 0) this.position[1] -= 1;
        return;
      case Direction.DOWN:
        if (this.position[1] < this.rowSize - 1) this.position[1] += 1;
        return;
      case Direction.LEFT:
        if (this.position[0] > 0) this.position[0] -= 1;
        return;
      case Direction.RIGHT:
        if (this.position[0] < this.getColumnSize(this.position[1]) - 1) this.position[0] += 1;
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
