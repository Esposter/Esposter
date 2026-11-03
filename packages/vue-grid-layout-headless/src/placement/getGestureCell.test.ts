import { getGestureCell } from "#src/placement/getGestureCell";
import { describe, expect, test } from "vitest";

describe(getGestureCell, () => {
  const columnNumber = 12;
  const columnPitch = 50;
  const rowPitch = 50;

  test("a resize pulls the south-east corner and keeps the origin", () => {
    expect.hasAssertions();

    expect(
      getGestureCell({
        columnNumber,
        columnPitch,
        isResize: true,
        offset: { x: 50, y: 50 },
        origin: { h: 2, id: "a", w: 2, x: 2, y: 1 },
        rowPitch,
      }),
    ).toStrictEqual({ h: 3, id: "a", w: 3, x: 2, y: 1 });
  });

  // A resize or a move stops at the grid's sides and at the least span, so its cell never leaves the grid
  test.each([
    {
      expected: { h: 2, id: "a", w: 2, x: 10, y: 0 },
      isResize: true,
      offset: { x: 500, y: 50 },
      origin: { h: 1, id: "a", w: 2, x: 10, y: 0 },
      title: "a resize stops at the grid's right side",
    },
    {
      expected: { h: 1, id: "a", w: 1, x: 0, y: 0 },
      isResize: true,
      offset: { x: -500, y: -500 },
      origin: { h: 2, id: "a", w: 2, x: 0, y: 0 },
      title: "a resize dragged past its least span keeps one cell",
    },
    {
      expected: { h: 1, id: "a", w: 2, x: 0, y: 0 },
      isResize: false,
      offset: { x: 0, y: -500 },
      origin: { h: 1, id: "a", w: 2, x: 0, y: 1 },
      title: "a move stops at row 0",
    },
  ])("$title", ({ expected, isResize, offset, origin }) => {
    expect.hasAssertions();

    expect(getGestureCell({ columnNumber, columnPitch, isResize, offset, origin, rowPitch })).toStrictEqual(expected);
  });

  test("moves a visual by whole cells and keeps it within the columns", () => {
    expect.hasAssertions();

    expect(
      getGestureCell({
        columnNumber,
        columnPitch,
        isResize: false,
        offset: { x: 1000, y: 60 },
        origin: { h: 1, id: "a", w: 2, x: 0, y: 0 },
        rowPitch,
      }),
    ).toStrictEqual({ h: 1, id: "a", w: 2, x: 10, y: 1 });
  });
});
