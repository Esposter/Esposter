import { Grid } from "@/models/dungeons/Grid";
import { Direction } from "grid-engine";
import { describe, expect, test, vi } from "vitest";

// `grid-engine` re-exports Phaser, which touches `window` and a canvas context at import — neither of which this
// Class uses. Only the direction enum is real machinery here, so it is the only thing the mock supplies
vi.mock(import("grid-engine"), () => ({
  Direction: {
    DOWN: "down",
    DOWN_LEFT: "down-left",
    DOWN_RIGHT: "down-right",
    LEFT: "left",
    NONE: "none",
    RIGHT: "right",
    UP: "up",
    UP_LEFT: "up-left",
    UP_RIGHT: "up-right",
    // The dynamic-import form types the factory against the real module, and these literals are the enum's own
    // Values rather than its members
  } as unknown as typeof Direction,
}));

// The invariants every dungeons menu navigates by, rather than a description of how the walk is written.
describe(Grid, () => {
  const GRID = [
    ["a", "b", "c"],
    ["d", "e", "f"],
  ] as const;
  // A hole the cursor must step over: `validate` rejects an absent value before any caller predicate runs
  const HOLED_GRID = [["a", undefined, "c"]] as const;
  // Rows of unequal length, which the settings menu is — every option row is as wide as it has values
  const RAGGED_GRID = [["a", "b", "c"], ["d"], ["e", "f", "g"]] as const;

  test.each([
    [Direction.UP, { x: 1, y: 1 }, { x: 1, y: 0 }],
    [Direction.DOWN, { x: 1, y: 0 }, { x: 1, y: 1 }],
    [Direction.LEFT, { x: 1, y: 0 }, { x: 0, y: 0 }],
    [Direction.RIGHT, { x: 1, y: 0 }, { x: 2, y: 0 }],
  ])("moves %s off %j", (direction, from, to) => {
    expect.hasAssertions();

    const grid = new Grid({ grid: GRID, position: ref(from) });
    grid.move(direction);

    expect(grid.position.value).toStrictEqual(to);
  });

  test.each([
    [Direction.UP, { x: 0, y: 0 }],
    [Direction.DOWN, { x: 0, y: 1 }],
    [Direction.LEFT, { x: 0, y: 0 }],
    [Direction.RIGHT, { x: 2, y: 0 }],
  ])("holds still moving %s off its edge, rather than stepping outside", (direction, from) => {
    expect.hasAssertions();

    // Without wrap the candidate never leaves the edge, and the edge is a position that validates — so the walk
    // Ends on the first iteration by assigning the cursor to where it already was. A cursor at the top of a menu
    // Pressing up is the ordinary case, so it is a no-op rather than an error
    const grid = new Grid({ grid: GRID, position: ref({ ...from }) });
    grid.move(direction);

    expect(grid.position.value).toStrictEqual(from);
  });

  test("throws only once no position on the axis is reachable", () => {
    expect.hasAssertions();

    // The walk runs out of candidates rather than running out of grid, which is the one case the error names
    const grid = new Grid({ grid: GRID, position: ref({ x: 0, y: 0 }), validate: () => false });

    expect(() => {
      grid.move(Direction.RIGHT);
    }).toThrowErrorMatchingInlineSnapshot(`[InvalidOperationError: Invalid operation: Update, name: move, 2]`);
  });

  test.each([
    [Direction.UP, { x: 0, y: 0 }, { x: 0, y: 1 }],
    [Direction.DOWN, { x: 0, y: 1 }, { x: 0, y: 0 }],
    [Direction.LEFT, { x: 0, y: 0 }, { x: 2, y: 0 }],
    [Direction.RIGHT, { x: 2, y: 0 }, { x: 0, y: 0 }],
  ])("wraps %s to the far edge when wrap is on", (direction, from, to) => {
    expect.hasAssertions();

    const grid = new Grid({ grid: GRID, position: ref(from), wrap: true });
    grid.move(direction);

    expect(grid.position.value).toStrictEqual(to);
  });

  test("steps over a position that holds no value", () => {
    expect.hasAssertions();

    const grid = new Grid({ grid: HOLED_GRID, position: ref({ x: 0, y: 0 }) });
    grid.move(Direction.RIGHT);

    expect(grid.position.value).toStrictEqual({ x: 2, y: 0 });
  });

  test("lands on a rejected position when validation is skipped", () => {
    expect.hasAssertions();

    // The skip is what lets a caller place the cursor somewhere its own predicate would refuse
    const grid = new Grid({ grid: GRID, position: ref({ x: 0, y: 0 }), validate: () => false });
    grid.move(Direction.RIGHT, true);

    expect(grid.position.value).toStrictEqual({ x: 1, y: 0 });
  });

  test("consults the caller's predicate on top of the absent-value check", () => {
    expect.hasAssertions();

    const grid = new Grid({
      grid: GRID,
      position: ref({ x: 0, y: 0 }),
      validate: ({ x }) => x !== 1,
    });
    grid.move(Direction.RIGHT);

    expect(grid.position.value).toStrictEqual({ x: 2, y: 0 });
  });

  test.each([Direction.UP_LEFT, Direction.UP_RIGHT, Direction.DOWN_LEFT, Direction.DOWN_RIGHT, Direction.NONE])(
    "ignores %s, which the grid has no axis for",
    (direction) => {
      expect.hasAssertions();

      const grid = new Grid({ grid: GRID, position: ref({ x: 1, y: 1 }) });
      grid.move(direction);

      expect(grid.position.value).toStrictEqual({ x: 1, y: 1 });
    },
  );

  test("reads the flattened index and the value under the cursor", () => {
    expect.hasAssertions();

    const grid = new Grid({ grid: GRID, position: ref({ x: 1, y: 1 }) });

    expect(grid.index).toBe(4);
    expect(grid.value).toBe("e");
    expect(grid.rowSize).toBe(2);
    expect(grid.getColumnSize(0)).toBe(3);
  });

  test("crosses a row too short to hold the cursor's column", () => {
    expect.hasAssertions();

    // A column the row does not reach is a hole like any other, so the walk carries on past it. Reading it as a
    // Fault stops the cursor at the short row and every row beyond it is unreachable
    const grid = new Grid({ grid: RAGGED_GRID, position: ref({ x: 2, y: 0 }) });
    grid.move(Direction.DOWN);

    expect(grid.position.value).toStrictEqual({ x: 2, y: 2 });
  });

  test("answers no rather than throwing for a row the grid has lost", () => {
    expect.hasAssertions();

    // The inventory shrinks under a cursor still sitting on the row an emptied item occupied, and asks whether
    // That position is still valid before moving off it. A throw there strands the cursor instead of moving it
    const grid = ref([["a"], ["b"]]);
    const cursorGrid = new Grid({ grid, position: ref({ x: 0, y: 1 }) });
    grid.value = [["a"]];

    expect(unref(cursorGrid.validate(cursorGrid.position.value))).toBe(false);
  });

  test("finds a value on the last row", () => {
    expect.hasAssertions();

    // The last row is as searchable as any other — a caller resolving a value to its row gets 0 for anything the
    // Search skips, which is a different row's answer rather than no answer
    const grid = new Grid({ grid: RAGGED_GRID, position: ref({ x: 0, y: 0 }) });

    expect(grid.getPosition("g")).toStrictEqual({ x: 2, y: 2 });
  });

  test("finds a value's column, and reports none for a value that is on another row", () => {
    expect.hasAssertions();

    // The search is per row rather than over the whole grid, which is what lets a caller keep the cursor's row
    const grid = new Grid({ grid: GRID, position: ref({ x: 0, y: 0 }) });

    expect(grid.getPositionX("c", 0)).toBe(2);
    expect(grid.getPositionX("d", 0)).toBeUndefined();
  });
});
