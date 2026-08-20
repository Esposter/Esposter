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
      case Direction.UP:
        return this.#step("y", -1, isSkipValidation);
      case Direction.DOWN:
        return this.#step("y", 1, isSkipValidation);
      case Direction.LEFT:
        return this.#step("x", -1, isSkipValidation);
      case Direction.RIGHT:
        return this.#step("x", 1, isSkipValidation);
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
  // Walks one axis until it reaches a position the cursor may sit on, so a row of holes is stepped over rather
  // Than stopping at the first. Without `wrap` the candidate stops at the edge and the walk ends by assigning the
  // Cursor where it already was — pressing up at the top of a menu does nothing rather than failing, and only a
  // Walk that finds nothing valid throws. The axis bound is the row count vertically, the row's length across
  #step(axis: "x" | "y", delta: -1 | 1, isSkipValidation?: boolean) {
    const size = axis === "y" ? this.rowSize : this.getColumnSize(this.position.value.y);
    const lastIndex = size - 1;
    let next = this.position.value[axis];

    for (let i = 0; i < size; i++) {
      if (delta === -1 ? next > 0 : next < lastIndex) next += delta;
      else if (this.wrap) next = delta === -1 ? lastIndex : 0;

      if (!(isSkipValidation || this.#internalValidate({ ...this.position.value, [axis]: next }))) continue;

      this.position.value[axis] = next;
      return;
    }

    throw new InvalidOperationError(Operation.Update, this.move.name, next.toString());
  }
}
