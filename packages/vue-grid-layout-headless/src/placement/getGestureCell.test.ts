import { ResizeEdge } from "#src/models/ResizeEdge";
import { getGestureCell } from "#src/placement/getGestureCell";
import { describe, expect, test } from "vitest";

describe(getGestureCell, () => {
  const columnNumber = 12;
  const columnPitch = 50;
  const rowPitch = 50;
  // Every edge is drawn from the same origin and pointer offset, so each row shows only what its own edge pulls
  const cellOrigin = { h: 2, id: "a", w: 2, x: 2, y: 1 };
  const pointerOffset = { x: 50, y: 50 };

  test.each([
    [ResizeEdge.East, { h: 2, id: "a", w: 3, x: 2, y: 1 }],
    [ResizeEdge.North, { h: 1, id: "a", w: 2, x: 2, y: 2 }],
    [ResizeEdge.NorthEast, { h: 1, id: "a", w: 3, x: 2, y: 2 }],
    [ResizeEdge.NorthWest, { h: 1, id: "a", w: 1, x: 3, y: 2 }],
    [ResizeEdge.South, { h: 3, id: "a", w: 2, x: 2, y: 1 }],
    [ResizeEdge.SouthEast, { h: 3, id: "a", w: 3, x: 2, y: 1 }],
    [ResizeEdge.SouthWest, { h: 3, id: "a", w: 1, x: 3, y: 1 }],
    [ResizeEdge.West, { h: 2, id: "a", w: 1, x: 3, y: 1 }],
  ])("%s pulls only its own sides", (edge, expected) => {
    expect.hasAssertions();

    expect(
      getGestureCell({ columnNumber, columnPitch, edge, offset: pointerOffset, origin: cellOrigin, rowPitch }),
    ).toStrictEqual(expected);
  });

  // A resize or a move stops at the grid's sides and at the least span, so its cell never leaves the grid
  test.each([
    {
      edge: ResizeEdge.East,
      expected: { h: 2, id: "a", w: 2, x: 10, y: 0 },
      offset: { x: 500, y: 0 },
      origin: { h: 2, id: "a", w: 2, x: 10, y: 0 },
      title: "East stops at the grid's right side",
    },
    {
      edge: ResizeEdge.SouthEast,
      expected: { h: 2, id: "a", w: 2, x: 10, y: 0 },
      offset: { x: 500, y: 50 },
      origin: { h: 1, id: "a", w: 2, x: 10, y: 0 },
      title: "SouthEast stops at the grid's right side",
    },
    {
      edge: ResizeEdge.North,
      expected: { h: 3, id: "a", w: 2, x: 0, y: 0 },
      offset: { x: 0, y: -500 },
      origin: { h: 2, id: "a", w: 2, x: 0, y: 1 },
      title: "North stops at the top",
    },
    {
      edge: ResizeEdge.SouthEast,
      expected: { h: 1, id: "a", w: 1, x: 0, y: 0 },
      offset: { x: -500, y: -500 },
      origin: { h: 2, id: "a", w: 2, x: 0, y: 0 },
      title: "a resize dragged past its least span keeps one cell",
    },
    {
      edge: undefined,
      expected: { h: 1, id: "a", w: 2, x: 0, y: 0 },
      offset: { x: 0, y: -500 },
      origin: { h: 1, id: "a", w: 2, x: 0, y: 1 },
      title: "a move stops at row 0",
    },
  ])("$title", ({ edge, expected, offset, origin }) => {
    expect.hasAssertions();

    expect(getGestureCell({ columnNumber, columnPitch, edge, offset, origin, rowPitch })).toStrictEqual(expected);
  });

  test("moves a visual by whole cells and keeps it within the columns", () => {
    expect.hasAssertions();

    expect(
      getGestureCell({
        columnNumber,
        columnPitch,
        offset: { x: 1000, y: 60 },
        origin: { h: 1, id: "a", w: 2, x: 0, y: 0 },
        rowPitch,
      }),
    ).toStrictEqual({ h: 1, id: "a", w: 2, x: 10, y: 1 });
  });
});
