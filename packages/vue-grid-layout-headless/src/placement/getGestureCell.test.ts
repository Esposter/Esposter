import { GridGestureType } from "#src/models/GridGestureType";
import { getGestureCell } from "#src/placement/getGestureCell";
import { describe, expect, test } from "vitest";

describe(getGestureCell, () => {
  const columnNumber = 12;
  const columnPitch = 50;
  const rowPitch = 50;

  // Dragged well past the top-left corner of its handle, the resize goes under one cell and stops there
  test("#28 Shrinking a visual to nothing keeps it one cell wide and tall", () => {
    expect.hasAssertions();

    expect(
      getGestureCell({
        columnNumber,
        columnPitch,
        kind: GridGestureType.Resize,
        offset: { x: -500, y: -500 },
        origin: { h: 2, id: "a", w: 2, x: 0, y: 0 },
        rowPitch,
      }),
    ).toStrictEqual({ h: 1, id: "a", w: 1, x: 0, y: 0 });
  });

  test("moves a visual by whole cells and keeps it within the columns", () => {
    expect.hasAssertions();

    expect(
      getGestureCell({
        columnNumber,
        columnPitch,
        kind: GridGestureType.Move,
        offset: { x: 1000, y: 60 },
        origin: { h: 1, id: "a", w: 2, x: 0, y: 0 },
        rowPitch,
      }),
    ).toStrictEqual({ h: 1, id: "a", w: 2, x: 10, y: 1 });
  });
});
