import { CompactType } from "#src/models/CompactType";
import { compactLayout } from "#src/placement/compactLayout";
import { describe, expect, test } from "vitest";

describe(compactLayout, () => {
  const columnNumber = 4;

  test("compacting upward", () => {
    expect.hasAssertions();

    expect(compactLayout([{ h: 1, id: "a", w: 1, x: 0, y: 5 }], columnNumber, CompactType.Vertical)).toStrictEqual([
      { h: 1, id: "a", w: 1, x: 0, y: 0 },
    ]);
  });

  test("stops an item under the one it touches", () => {
    expect.hasAssertions();

    expect(
      compactLayout(
        [
          { h: 2, id: "a", w: 1, x: 0, y: 0 },
          { h: 1, id: "b", w: 1, x: 0, y: 5 },
        ],
        columnNumber,
        CompactType.Vertical,
      ),
    ).toStrictEqual([
      { h: 2, id: "a", w: 1, x: 0, y: 0 },
      { h: 1, id: "b", w: 1, x: 0, y: 2 },
    ]);
  });

  test("moves an item that starts inside another down until it clears", () => {
    expect.hasAssertions();

    expect(
      compactLayout(
        [
          { h: 2, id: "a", w: 2, x: 0, y: 0 },
          { h: 1, id: "b", w: 2, x: 0, y: 1 },
        ],
        columnNumber,
        CompactType.Vertical,
      ),
    ).toStrictEqual([
      { h: 2, id: "a", w: 2, x: 0, y: 0 },
      { h: 1, id: "b", w: 2, x: 0, y: 2 },
    ]);
  });

  test("an item left overlapping under no compaction moves down until it clears", () => {
    expect.hasAssertions();

    // The layout a push leaves when b is moved onto a's rows, so b is lower than a's bottom edge and must not stay within it
    expect(
      compactLayout(
        [
          { h: 4, id: "a", w: 1, x: 0, y: 0 },
          { h: 1, id: "b", w: 1, x: 0, y: 3 },
        ],
        columnNumber,
        CompactType.None,
      ),
    ).toStrictEqual([
      { h: 4, id: "a", w: 1, x: 0, y: 0 },
      { h: 1, id: "b", w: 1, x: 0, y: 4 },
    ]);
  });

  test("a horizontal push past the last column moves the item down a row and back along it", () => {
    expect.hasAssertions();

    const layout = compactLayout(
      [
        { h: 1, id: "a", w: 3, x: 0, y: 0 },
        { h: 1, id: "b", w: 2, x: 0, y: 0 },
      ],
      columnNumber,
      CompactType.Horizontal,
    );

    expect(layout).toStrictEqual([
      { h: 1, id: "a", w: 3, x: 0, y: 0 },
      { h: 1, id: "b", w: 2, x: 0, y: 1 },
    ]);
    expect(compactLayout(layout, columnNumber, CompactType.Horizontal)).toStrictEqual(layout);
  });

  test("two items on one cell keep their input order, the earlier keeping the cell", () => {
    expect.hasAssertions();

    expect(
      compactLayout(
        [
          { h: 1, id: "a", w: 1, x: 0, y: 0 },
          { h: 1, id: "b", w: 1, x: 0, y: 0 },
        ],
        columnNumber,
        CompactType.Vertical,
      ),
    ).toStrictEqual([
      { h: 1, id: "a", w: 1, x: 0, y: 0 },
      { h: 1, id: "b", w: 1, x: 0, y: 1 },
    ]);
  });
});
