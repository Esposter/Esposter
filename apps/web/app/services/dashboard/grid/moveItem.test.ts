import { moveItem } from "@/services/dashboard/grid/moveItem";
import { describe, expect, test } from "vitest";

describe(moveItem, () => {
  test("dropping a visual onto another pushes the other below it", () => {
    expect.hasAssertions();

    expect(
      moveItem(
        [
          { h: 2, id: "a", w: 2, x: 0, y: 0 },
          { h: 2, id: "b", w: 2, x: 4, y: 0 },
        ],
        { h: 2, id: "a", w: 2, x: 4, y: 0 },
      ),
    ).toStrictEqual([
      { h: 2, id: "a", w: 2, x: 4, y: 0 },
      { h: 2, id: "b", w: 2, x: 4, y: 2 },
    ]);
  });

  test("pushes each visual a moved visual lands on, in turn", () => {
    expect.hasAssertions();

    expect(
      moveItem(
        [
          { h: 1, id: "a", w: 2, x: 0, y: 0 },
          { h: 1, id: "b", w: 2, x: 0, y: 1 },
          { h: 1, id: "c", w: 2, x: 0, y: 2 },
        ],
        { h: 1, id: "a", w: 2, x: 0, y: 1 },
      ),
    ).toStrictEqual([
      { h: 1, id: "a", w: 2, x: 0, y: 1 },
      { h: 1, id: "b", w: 2, x: 0, y: 2 },
      { h: 1, id: "c", w: 2, x: 0, y: 3 },
    ]);
  });

  test("leaves a visual the moved one has passed over by more than a quarter of its height where it is", () => {
    expect.hasAssertions();

    expect(
      moveItem(
        [
          { h: 4, id: "a", w: 1, x: 0, y: 0 },
          { h: 1, id: "b", w: 1, x: 0, y: 5 },
        ],
        { h: 1, id: "b", w: 1, x: 0, y: 3 },
      ),
    ).toStrictEqual([
      { h: 4, id: "a", w: 1, x: 0, y: 0 },
      { h: 1, id: "b", w: 1, x: 0, y: 3 },
    ]);
  });
});
