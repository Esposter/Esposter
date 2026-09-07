import { computeSplitTransformation } from "@/services/resource/sheet/column/transformation/string/computeSplitTransformation";
import { describe, expect, test } from "vitest";

// The null guard and String(...) coercion of the source value live in ColumnTransformationComputeMap; here only the segment selection
describe(computeSplitTransformation, () => {
  test("returns the segment at the index", () => {
    expect.hasAssertions();
    expect(computeSplitTransformation("a,b", ",", 0)).toBe("a");
    expect(computeSplitTransformation("a,b", ",", 1)).toBe("b");
  });

  test("returns the segment counted from the end for a negative index", () => {
    expect.hasAssertions();
    expect(computeSplitTransformation("a,b", ",", -1)).toBe("b");
  });

  test("returns null when the index is out of range", () => {
    expect.hasAssertions();
    expect(computeSplitTransformation("a,b", ",", 2)).toBeNull();
    expect(computeSplitTransformation("a,b", ",", -3)).toBeNull();
  });

  test("returns the whole value when the delimiter is absent", () => {
    expect.hasAssertions();
    expect(computeSplitTransformation("a", ",", 0)).toBe("a");
  });

  test("returns an empty segment as an empty string", () => {
    expect.hasAssertions();
    expect(computeSplitTransformation(",", ",", 0)).toBe("");
  });
});
