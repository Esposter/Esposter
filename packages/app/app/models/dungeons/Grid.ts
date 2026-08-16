/* eslint-disable perfectionist/sort-switch-case */
import type { GridValue } from "@/models/dungeons/GridValue";
import type { Position } from "grid-engine";
import type { SetRequired } from "type-fest";
import type { UnwrapRef } from "vue";

import { exhaustiveGuard, InvalidOperationError, Operation, takeOne } from "@esposter/shared";
import { Direction } from "grid-engine";

export class Grid<TGrid extends readonly (readonly unknown[])[]> {
  // Our grid may be purely computed based on some external 1D array
  grid: MaybeRef<TGrid>;
  position: Ref<Position>;
  validate: (this: Grid<TGrid>, position: Position) => MaybeRef<boolean>;
  wrap: boolean;
  // Going from top-left to bottom-right
  get index() {
    let index = this.position.value.x;
    for (let i = 0; i < this.position.value.y; i++) index += this.getColumnSize(i);
    return index;
  }

  get rowSize() {
    return unref(this.grid).length;
  }
  get value() {
    return takeOne(takeOne(unref(this.grid), this.position.value.y), this.position.value.x);
  }

  readonly #internalValidate: (
    ...args: Parameters<typeof this.validate>
  ) => UnwrapRef<ReturnType<typeof this.validate>>;

  constructor({
    grid,
    position = ref({ x: 0, y: 0 }),
    validate,
    wrap = false,
  }: SetRequired<Partial<Grid<TGrid>>, "grid">) {
    this.validate = (targetPosition) => {
      const value = this.getValue(targetPosition);
      // We want to skip grid values that don't exist
      if (value === undefined) return false;
      return validate?.bind(this)(targetPosition) ?? true;
    };
    this.#internalValidate = (...args) => unref(this.validate(...args));
    this.grid = grid;
    this.position = position;
    this.wrap = wrap;
  }
  // This is the array index if the grid were to be flattened
  getColumnSize(rowIndex: number) {
    if (rowIndex > this.rowSize - 1)
      throw new InvalidOperationError(Operation.Read, this.constructor.name, `row index: ${rowIndex}`);
    return takeOne(unref(this.grid), rowIndex).length;
  }

  getPosition(value: GridValue<TGrid>): Position | undefined {
    for (let y = 0; y < this.rowSize - 1; y++)
      for (let x = 0; x < this.getColumnSize(y); x++) {
        const position: Position = { x, y };
        if (this.getValue(position) === value) return position;
      }

    return undefined;
  }

  getPositionX(value: GridValue<TGrid>, y: number): number | undefined {
    for (let x = 0; x < this.getColumnSize(y); x++) if (this.getValue({ x, y }) === value) return x;

    return undefined;
  }

  getValue({ x, y }: Position) {
    if (x > this.getColumnSize(y))
      throw new InvalidOperationError(Operation.Read, this.constructor.name, `position: { x: ${x}, y: ${y} }`);
    return takeOne(takeOne(unref(this.grid), y), x);
  }

  move(direction: Direction, isSkipValidation?: boolean) {
    switch (direction) {
      case Direction.UP: {
        let newPositionY = this.position.value.y;

        for (let i = 0; i < this.rowSize; i++) {
          if (newPositionY > 0) newPositionY -= 1;
          else if (this.wrap && newPositionY === 0) newPositionY = this.rowSize - 1;

          if (!(isSkipValidation || this.#internalValidate({ x: this.position.value.x, y: newPositionY }))) continue;

          this.position.value.y = newPositionY;
          return;
        }

        throw new InvalidOperationError(Operation.Update, this.move.name, newPositionY.toString());
      }
      case Direction.DOWN: {
        let newPositionY = this.position.value.y;

        for (let i = 0; i < this.rowSize; i++) {
          if (newPositionY < this.rowSize - 1) newPositionY += 1;
          else if (this.wrap && newPositionY === this.rowSize - 1) newPositionY = 0;

          if (!(isSkipValidation || this.#internalValidate({ x: this.position.value.x, y: newPositionY }))) continue;

          this.position.value.y = newPositionY;
          return;
        }

        throw new InvalidOperationError(Operation.Update, this.move.name, newPositionY.toString());
      }
      case Direction.LEFT: {
        let newPositionX = this.position.value.x;

        for (let i = 0; i < this.getColumnSize(this.position.value.y); i++) {
          if (newPositionX > 0) newPositionX -= 1;
          else if (this.wrap && newPositionX === 0) newPositionX = this.getColumnSize(this.position.value.y) - 1;

          if (!(isSkipValidation || this.#internalValidate({ x: newPositionX, y: this.position.value.y }))) continue;

          this.position.value.x = newPositionX;
          return;
        }

        throw new InvalidOperationError(Operation.Update, this.move.name, newPositionX.toString());
      }
      case Direction.RIGHT: {
        let newPositionX = this.position.value.x;

        for (let i = 0; i < this.getColumnSize(this.position.value.y); i++) {
          if (newPositionX < this.getColumnSize(this.position.value.y) - 1) newPositionX += 1;
          else if (this.wrap && newPositionX === this.getColumnSize(this.position.value.y) - 1) newPositionX = 0;

          if (!(isSkipValidation || this.#internalValidate({ x: newPositionX, y: this.position.value.y }))) continue;

          this.position.value.x = newPositionX;
          return;
        }

        throw new InvalidOperationError(Operation.Update, this.move.name, newPositionX.toString());
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
}
