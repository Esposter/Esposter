import { InvalidOperationError, Operation, exhaustiveGuard } from "@esposter/shared";
import type { Position } from "grid-engine";
import { Direction } from "grid-engine";

export class Grid<TValue, TGrid extends readonly (readonly TValue[])[]> {
  grid: TGrid;
  wrap: boolean;
  position: Position;

  constructor(grid: TGrid, wrap = false, position: Position = { x: 0, y: 0 }) {
    this.grid = grid;
    this.wrap = wrap;
    this.position = position;
  }
  // This is the array index if the grid were to be flattened
  // going from top-left to bottom-right
  get index() {
    let index = this.position.x;
    for (let i = 0; i < this.position.y; i++) index += this.getColumnSize(i);
    return index;
  }

  get value() {
    return this.grid[this.position.y][this.position.x];
  }

  getValue({ x, y }: Position) {
    if (x > this.getColumnSize(y))
      throw new InvalidOperationError(Operation.Read, this.constructor.name, `position: { x: ${x}, y: ${y} }`);
    return this.grid[y][x];
  }

  get rowSize() {
    return this.grid.length;
  }

  getColumnSize(rowIndex: number) {
    if (rowIndex > this.rowSize - 1)
      throw new InvalidOperationError(Operation.Read, this.constructor.name, `row index: ${rowIndex}`);
    return this.grid[rowIndex].length;
  }

  getPosition(value: TValue): Position | null {
    for (let y = 0; y < this.rowSize - 1; y++)
      for (let x = 0; x < this.getColumnSize(y); x++) {
        const position: Position = { x, y };
        if (this.getValue(position) === value) return position;
      }

    return null;
  }

  getPositionX(value: TValue, y: number): number | null {
    for (let x = 0; x < this.getColumnSize(y); x++) if (this.getValue({ x, y }) === value) return x;
    return null;
  }

  move(direction: Direction) {
    switch (direction) {
      case Direction.UP: {
        let newPositionY = this.position.y;

        for (let i = 0; i < this.rowSize; i++) {
          if (newPositionY > 0) newPositionY -= 1;
          else if (this.wrap && newPositionY === 0) newPositionY = this.rowSize - 1;

          const newValue = this.getValue({ x: this.position.x, y: newPositionY });
          // We want to skip grid values that don't exist
          if (newValue === null || newValue === undefined) continue;

          this.position.y = newPositionY;
          return;
        }

        throw new InvalidOperationError(Operation.Update, this.move.name, direction);
      }
      case Direction.DOWN: {
        let newPositionY = this.position.y;

        for (let i = 0; i < this.rowSize; i++) {
          if (newPositionY < this.rowSize - 1) newPositionY += 1;
          else if (this.wrap && newPositionY === this.rowSize - 1) newPositionY = 0;

          const newValue = this.getValue({ x: this.position.x, y: newPositionY });
          // We want to skip grid values that don't exist
          if (newValue === null || newValue === undefined) continue;

          this.position.y = newPositionY;
          return;
        }

        throw new InvalidOperationError(Operation.Update, this.move.name, direction);
      }
      case Direction.LEFT:
        if (this.position.x > 0) this.position.x -= 1;
        else if (this.wrap && this.position.x === 0) this.position.x = this.getColumnSize(this.position.y) - 1;
        return;
      case Direction.RIGHT:
        if (this.position.x < this.getColumnSize(this.position.y) - 1) this.position.x += 1;
        else if (this.wrap && this.position.x === this.getColumnSize(this.position.y) - 1) this.position.x = 0;
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
