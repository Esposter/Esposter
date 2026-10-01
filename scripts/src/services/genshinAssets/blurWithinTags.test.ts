import { blurWithinTags } from "#src/services/genshinAssets/blurWithinTags";
import { describe, expect, test } from "vitest";

describe(blurWithinTags, () => {
  test("averages each cell over its own material's neighbours alone", () => {
    expect.hasAssertions();

    const values = Float32Array.from([0, 2, 10, 10]);
    const tags = Int16Array.from([0, 0, 1, 1]);

    expect([...blurWithinTags(values, tags, { height: 1, radius: 1, width: 4 })]).toStrictEqual([1, 1, 10, 10]);
  });
});
