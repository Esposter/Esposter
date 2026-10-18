import { evaluateGoExpression } from "#src/services/genshinAssets/kits/gcsim/evaluateGoExpression";
import { parseGoExpression } from "#src/services/genshinAssets/kits/gcsim/parseGoExpression";
import { tokenizeGo } from "#src/services/genshinAssets/kits/gcsim/tokenizeGo";
import { describe, expect, test } from "vitest";

// A name holding a whole-valued float, and one holding a whole number
const resolveThree = (name: string) => (name === "three" ? { float: 3 } : undefined);
const resolveSeven = (name: string) => (name === "seven" ? 7 : undefined);
const evaluate = (source: string, resolveName: Parameters<typeof evaluateGoExpression>[1] = () => undefined) =>
  evaluateGoExpression(parseGoExpression(tokenizeGo(source), 0).expression, resolveName);

describe(evaluateGoExpression, () => {
  test("a float division keeps its fraction", () => {
    expect.hasAssertions();

    // A decimal literal, a float64 conversion and a name holding a whole float are each a float, so the fraction stays
    expect([evaluate("3.0 / 2"), evaluate("float64(3) / 2"), evaluate("three / 2", resolveThree)]).toStrictEqual([
      1.5, 1.5, 1.5,
    ]);
  });

  test("a whole division truncates", () => {
    expect.hasAssertions();

    expect([evaluate("7 / 2"), evaluate("-7 / 2"), evaluate("seven / 2", resolveSeven)]).toStrictEqual([3, -3, 3]);
  });
});
