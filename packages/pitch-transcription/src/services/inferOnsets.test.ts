import { inferOnsets } from "#src/services/inferOnsets";
import { describe, expect, test } from "vitest";

describe(inferOnsets, () => {
  test("adds an onset where a frame reading jumps, scaled to the largest onset reading", () => {
    expect.hasAssertions();

    const frames = [[0], [0], [0.5], [0.5]];
    const onsets = [[0], [0.2], [0], [0]];

    expect(inferOnsets(onsets, frames)).toStrictEqual([[0], [0.2], [0.2], [0]]);
  });

  test("hands the onsets back when no frame reading jumps", () => {
    expect.hasAssertions();

    const onsets = [[0], [0.2], [0]];

    expect(inferOnsets(onsets, [[0], [0], [0]])).toBe(onsets);
  });
});
