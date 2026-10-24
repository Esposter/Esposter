import { getNextDirection } from "@/services/dungeons/UI/input/getNextDirection";
import { Direction } from "grid-engine";
import { describe, expect, test } from "vitest";

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
