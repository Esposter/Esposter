import { fitLayout } from "#src/internal/placement/fitLayout";
import { CompactType } from "#src/models/CompactType";
import { describe, expect, test } from "vitest";

describe(fitLayout, () => {
  // The item on the right edge is moved in to the narrower grid, where it lands on the one beside it
  test("#16 Opening a dashboard on a phone fills the fewer columns without overlap", () => {
    expect.hasAssertions();

    expect(
      fitLayout(
        [
          { h: 2, id: "a", w: 2, x: 8, y: 0 },
          { h: 2, id: "b", w: 6, x: 0, y: 0 },
        ],
        6,
        CompactType.Vertical,
      ),
    ).toStrictEqual([
      { h: 2, id: "b", w: 6, x: 0, y: 0 },
      { h: 2, id: "a", w: 2, x: 4, y: 2 },
    ]);
  });
});
