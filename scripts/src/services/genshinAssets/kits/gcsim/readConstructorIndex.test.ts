import { readConstructorIndex } from "#src/services/genshinAssets/kits/gcsim/readConstructorIndex";
import { describe, expect, test } from "vitest";

describe("readConstructorIndex", () => {
  test("a table's declaration with no constructor between it and its use is its own line", () => {
    expect.hasAssertions();
    const lines = [
      "var tbl = []float64{1, 2}",
      "func a() {",
      "\tx := tbl[i]",
      "}",
      "func b() {",
      "\tcombat.NewCircleHitOnTarget(c, nil, 4)",
      "}",
    ];
    expect(readConstructorIndex(lines, 0)).toBe(0);
  });

  test("the first constructor below a use that binds a local reads that local", () => {
    expect.hasAssertions();
    const lines = [
      "var tbl = []float64{1, 2}",
      "func a() {",
      "\tx := tbl[i]",
      "}",
      "func b() {",
      "\tcombat.NewCircleHitOnTarget(c, nil, 4)",
      "\tcombat.NewCircleHitOnTarget(c, nil, x)",
      "}",
    ];
    expect(readConstructorIndex(lines, 0)).toBe(6);
  });
});
