import { checkIsColliding } from "#src/placement/checkIsColliding";
import { describe, expect, test } from "vitest";

describe(checkIsColliding, () => {
  const item = { h: 2, id: "a", w: 2, x: 0, y: 0 };

  test("collides with an item that shares a cell", () => {
    expect.hasAssertions();

    expect(checkIsColliding(item, { h: 2, id: "b", w: 2, x: 1, y: 1 })).toBe(true);
  });

  test("does not collide with an item that only touches an edge", () => {
    expect.hasAssertions();

    expect(checkIsColliding(item, { h: 2, id: "b", w: 2, x: 2, y: 0 })).toBe(false);
  });

  test("never collides with itself", () => {
    expect.hasAssertions();

    expect(checkIsColliding(item, item)).toBe(false);
  });
});
