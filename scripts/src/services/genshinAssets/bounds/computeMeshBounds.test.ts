import { computeMeshBounds } from "#src/services/genshinAssets/bounds/computeMeshBounds";
import { describe, expect, test } from "vitest";

describe(computeMeshBounds, () => {
  test("a mesh with no vertices has no bounds to read", () => {
    expect.hasAssertions();

    expect(() => computeMeshBounds([])).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: computeMeshBounds, has no vertices]`,
    );
  });
});
