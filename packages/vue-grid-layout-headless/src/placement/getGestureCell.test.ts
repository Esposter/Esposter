import { ResizeEdge } from "#src/models/ResizeEdge";
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
        edge: ResizeEdge.SouthEast,
        offset: { x: -500, y: -500 },
        origin: { h: 2, id: "a", w: 2, x: 0, y: 0 },
        rowPitch,
      }),
    ).toStrictEqual({ h: 1, id: "a", w: 1, x: 0, y: 0 });
  });

  // Pulling the left edge moves the origin and the span together, so the right edge stays where it was
  test("pulling the left edge keeps the right edge in place", () => {
    expect.hasAssertions();

    expect(
      getGestureCell({
        columnNumber,
        columnPitch,
        edge: ResizeEdge.West,
        offset: { x: -50, y: 0 },
        origin: { h: 2, id: "a", w: 2, x: 2, y: 0 },
        rowPitch,
      }),
    ).toStrictEqual({ h: 2, id: "a", w: 3, x: 1, y: 0 });
  });

  test("a resize from a corner moves both of its edges", () => {
    expect.hasAssertions();

    expect(
      getGestureCell({
        columnNumber,
        columnPitch,
        edge: ResizeEdge.NorthWest,
        offset: { x: -50, y: -50 },
        origin: { h: 2, id: "a", w: 2, x: 2, y: 1 },
        rowPitch,
      }),
    ).toStrictEqual({ h: 3, id: "a", w: 3, x: 1, y: 0 });
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
