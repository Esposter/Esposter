import { readGainsOverTime } from "#src/services/genshinParity/readGainsOverTime";
import { describe, expect, test } from "vitest";

describe(readGainsOverTime, () => {
  test("fits each window's gain apart", () => {
    expect.hasAssertions();

    expect(readGainsOverTime([{ floor: -60, game: [0, 6], ours: [0, 0] }], [0, 1], 1)).toStrictEqual([
      { gains: [0], start: 0 },
      { gains: [6], start: 1 },
    ]);
  });
});
