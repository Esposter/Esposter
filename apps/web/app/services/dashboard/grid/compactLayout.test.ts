import { compactLayout } from "@/services/dashboard/grid/compactLayout";
import { describe, expect, test } from "vitest";

describe(compactLayout, () => {
  test("rises an item to the top of its column", () => {
    expect.hasAssertions();

    expect(compactLayout([{ h: 1, id: "a", w: 1, x: 0, y: 5 }])).toStrictEqual([{ h: 1, id: "a", w: 1, x: 0, y: 0 }]);
  });

  test("stops an item under the one it touches", () => {
    expect.hasAssertions();

    expect(
      compactLayout([
        { h: 2, id: "a", w: 1, x: 0, y: 0 },
        { h: 1, id: "b", w: 1, x: 0, y: 5 },
      ]),
    ).toStrictEqual([
      { h: 2, id: "a", w: 1, x: 0, y: 0 },
      { h: 1, id: "b", w: 1, x: 0, y: 2 },
    ]);
  });

  test("moves an item that starts inside another down until it clears", () => {
    expect.hasAssertions();

    expect(
      compactLayout([
        { h: 2, id: "a", w: 2, x: 0, y: 0 },
        { h: 1, id: "b", w: 2, x: 0, y: 1 },
      ]),
    ).toStrictEqual([
      { h: 2, id: "a", w: 2, x: 0, y: 0 },
      { h: 1, id: "b", w: 2, x: 0, y: 2 },
    ]);
  });
});
