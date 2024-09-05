import type { Position } from "grid-engine";
import type { SetRequired } from "type-fest";
import type { UnwrapRef } from "vue";

import { exhaustiveGuard, InvalidOperationError, Operation } from "@esposter/shared";
import { Direction } from "grid-engine";

export class Grid<TValue, TGrid extends readonly (readonly TValue[])[]> {
  _getIsActive: (...args: Parameters<typeof this.getIsActive>) => UnwrapRef<ReturnType<typeof this.getIsActive>>;
  getIsActive: (this: Grid<TValue, TGrid>, position: Position) => MaybeRef<boolean>;
  grid: TGrid;
  position: Position;
  wrap: boolean;

  constructor({ getIsActive, grid, position, wrap }: SetRequired<Partial<Grid<TValue, TGrid>>, "grid">) {
    this.getIsActive = (position) => {
      const value = this.getValue(position);
      // We want to skip grid values that don't exist
      if (value === null || value === undefined) return false;
      return getIsActive?.bind(this)?.(position) ?? true;
    };
    this._getIsActive = (...args) => unref(this.getIsActive(...args));
    this.grid = grid;
    this.position = position ?? { x: 0, y: 0 };
    this.wrap = wrap ?? false;
  }
  // This is the array index if the grid were to be flattened
  getColumnSize(rowIndex: number) {
    if (rowIndex > this.rowSize - 1)
      throw new InvalidOperationError(Operation.Read, this.constructor.name, `row index: ${rowIndex}`);
    return this.grid[rowIndex].length;
  }

  getPosition(value: TValue): null | Position {
    for (let y = 0; y < this.rowSize - 1; y++)
      for (let x = 0; x < this.getColumnSize(y); x++) {
        const position: Position = { x, y };
        if (this.getValue(position) === value) return position;
      }

    return null;
  }

  getPositionX(value: TValue, y: number): null | number {
    for (let x = 0; x < this.getColumnSize(y); x++) if (this.getValue({ x, y }) === value) return x;
    return null;
  }

  getValue({ x, y }: Position) {
    if (x > this.getColumnSize(y))
      throw new InvalidOperationError(Operation.Read, this.constructor.name, `position: { x: ${x}, y: ${y} }`);
    return this.grid[y][x];
  }

  move(direction: Direction) {
    switch (direction) {
      case Direction.UP: {
        let newPositionY = this.position.y;

        for (let i = 0; i < this.rowSize; i++) {
          if (newPositionY > 0) newPositionY -= 1;
          else if (this.wrap && newPositionY === 0) newPositionY = this.rowSize - 1;

          if (!this._getIsActive({ x: this.position.x, y: newPositionY })) continue;

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

          if (!this._getIsActive({ x: this.position.x, y: newPositionY })) continue;

          this.position.y = newPositionY;
          return;
        }

        throw new InvalidOperationError(Operation.Update, this.move.name, direction);
      }
      case Direction.LEFT: {
        let newPositionX = this.position.x;

        for (let i = 0; i < this.getColumnSize(this.position.y); i++) {
          if (newPositionX > 0) newPositionX -= 1;
          else if (this.wrap && newPositionX === 0) newPositionX = this.getColumnSize(this.position.y) - 1;

          if (!this._getIsActive({ x: newPositionX, y: this.position.y })) continue;

          this.position.x = newPositionX;
          return;
        }

        throw new InvalidOperationError(Operation.Update, this.move.name, direction);
      }
      case Direction.RIGHT: {
        let newPositionX = this.position.x;

        for (let i = 0; i < this.getColumnSize(this.position.y); i++) {
          if (newPositionX < this.getColumnSize(this.position.y) - 1) newPositionX += 1;
          else if (this.wrap && newPositionX === this.getColumnSize(this.position.y) - 1) newPositionX = 0;

          if (!this._getIsActive({ x: newPositionX, y: this.position.y })) continue;

          this.position.x = newPositionX;
          return;
        }

        throw new InvalidOperationError(Operation.Update, this.move.name, direction);
      }
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

  // going from top-left to bottom-right
  get index() {
    let index = this.position.x;
    for (let i = 0; i < this.position.y; i++) index += this.getColumnSize(i);
    return index;
  }

  get rowSize() {
    return this.grid.length;
  }

  get value() {
    return this.grid[this.position.y][this.position.x];
  }
}
