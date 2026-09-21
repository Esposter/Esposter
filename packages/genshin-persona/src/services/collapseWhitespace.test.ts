import { collapseWhitespace } from "#src/services/collapseWhitespace";
import { describe, expect, test } from "vitest";

describe(collapseWhitespace, () => {
  test("a run inside and space at both ends", () => {
    expect.hasAssertions();

    expect(collapseWhitespace("  a \n b  ")).toBe("a b");
  });
});
