import { chunkPaths } from "#src/services/format/chunkPaths";
import { describe, expect, test } from "vitest";

describe(chunkPaths, () => {
  test("runs the paths in the order given, each run within the bound, and a path past the bound is a run of its own", () => {
    expect.hasAssertions();

    expect(chunkPaths(["a", "bb", "cc", "ddddddd", "e"], 5)).toStrictEqual([["a", "bb"], ["cc"], ["ddddddd"], ["e"]]);
  });
});
