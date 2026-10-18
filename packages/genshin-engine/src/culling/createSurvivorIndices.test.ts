import { createSurvivorIndices } from "#src/culling/createSurvivorIndices";
import { describe, expect, test } from "vitest";

describe(createSurvivorIndices, () => {
  test("lists every instance in order before any pass has culled", () => {
    expect.hasAssertions();

    expect(createSurvivorIndices(4)).toStrictEqual(new Uint32Array([0, 1, 2, 3]));
  });
});
