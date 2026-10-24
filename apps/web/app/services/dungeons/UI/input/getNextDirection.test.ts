import { getNextDirection } from "@/services/dungeons/UI/input/getNextDirection";
import { Direction } from "grid-engine";
import { describe, expect, test, vi } from "vitest";

// `grid-engine` re-exports Phaser, which touches `window` and a canvas context at import. Only the direction enum is
// Real machinery here, so it is the only thing the mock supplies
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
  } as typeof Direction,
}));

describe(getNextDirection, () => {
  const origin = { x: 5, y: 5 };

  test("faces the direction of a single step on either axis", () => {
    expect.hasAssertions();

    expect(getNextDirection(origin, { x: 5, y: 4 })).toBe(Direction.UP);
    expect(getNextDirection(origin, { x: 5, y: 6 })).toBe(Direction.DOWN);
    expect(getNextDirection(origin, { x: 4, y: 5 })).toBe(Direction.LEFT);
    expect(getNextDirection(origin, { x: 6, y: 5 })).toBe(Direction.RIGHT);
  });

  test("faces nowhere when the next position is the current one", () => {
    expect.hasAssertions();

    expect(getNextDirection(origin, { x: 5, y: 5 })).toBe(Direction.NONE);
  });

  test("a diagonal step faces its vertical component", () => {
    expect.hasAssertions();

    expect(getNextDirection(origin, { x: 6, y: 4 })).toBe(Direction.UP);
    expect(getNextDirection(origin, { x: 4, y: 6 })).toBe(Direction.DOWN);
  });
});
