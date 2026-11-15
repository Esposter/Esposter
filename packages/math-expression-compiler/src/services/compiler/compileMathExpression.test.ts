import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";

import { MathExpressionNodeType } from "#src/models/shared/MathExpressionNodeType";
import { compileMathExpression } from "#src/services/compiler/compileMathExpression";
import { parseNode } from "#src/services/compiler/parseNode.fixture";
import { getMathExpressionNames } from "#src/services/names/getMathExpressionNames";
import { describe, expect, test } from "vitest";

const evaluateFormula = (formula: string, scope: Record<string, number> = {}): number =>
  compileMathExpression(parseNode(formula), Object.keys(scope))(Object.values(scope));
const evaluateCall = (name: string, args: MathExpressionNode[]): number =>
  compileMathExpression({ arguments: args, name, type: MathExpressionNodeType.Call }, [])([]);

describe(compileMathExpression, () => {
  const SCOPE = { col0: 3, col1: -2.5 };

  test.each([
    ["Power binds tighter than a sign", "-2 ^ 2", {}, -4],
    ["Modulo takes the sign of the divisor", "mod(-1, 3)", {}, 2],
    ["A trailing percent sign is a percentage of the left side", "100 + 3%", {}, 103],
    ["A name beside a number multiplies it", "2 col0", SCOPE, 6],
    ["A quotient beside a name multiplies it, as an explicit product does", "1/2 col0", { col0: 4 }, 2],
    ["A name beside a number and a division multiplies left to right", "2 col0 / 4", { col0: 3 }, 1.5],
    [
      "A name after a quotient of names multiplies the quotient, left to right",
      "col0 / 2 col1",
      { col0: 8, col1: 2 },
      8,
    ],
    ["A signed divisor before a name is a quotient times the name", "1/-2 col0", { col0: 4 }, -2],
    ["Rounding goes half away from zero", "round(-2.5)", {}, -3],
    ["A bare comparison has a value", "col0 > 3", { col0: 5 }, 1],
    ["A chained comparison holds only when each pair does", "1 < 3 < 2", {}, 0],
    ["A prototype member's name is unknown", "constructor", {}, Number.NaN],
    ["A name that is no column is an error", "unknownName + 1", {}, Number.NaN],
    ["A name read before its assignment with no outer value is an error", "x + (x = 1)", {}, Number.NaN],
    ["An assignment is read back by the formula", "(x = col0 + 1) * x", SCOPE, 16],
    ["A variable reads its outer value until its assignment runs", "x * (x = 2)", { x: 3 }, 6],
    ["A constant reads its value until its assignment runs", "pi * (pi = 1)", {}, Math.PI],
  ])("%s", (_title, formula, scope, expected) => {
    expect.hasAssertions();

    expect(evaluateFormula(formula, scope)).toBe(expected);
  });

  test("a compiled function called twice gives the same value", () => {
    expect.hasAssertions();

    const compiled = compileMathExpression(parseNode("(x = col0 * 2) + x"), ["col0"]);

    expect(compiled([3])).toBe(12);
    expect(compiled([3])).toBe(12);
  });

  test.each([
    ["0 and foo", 0],
    ["1 or foo", 1],
    ["1 ? 2 : foo", 2],
    ["0 ? foo : 3", 3],
    ["0 & foo", 0],
    ["-1 | foo", -1],
  ])("%s reads its right side only when the left side does not decide it", (formula, expected) => {
    expect.hasAssertions();

    expect(evaluateFormula(formula)).toBe(expected);
  });

  test.each([["-0 + -0"], ["sum([-0, -0])"], ["add(-0, -0, -0)"]])(
    "a sum of negative zeros is negative zero, as mathjs sums: %s",
    (formula) => {
      expect.hasAssertions();

      expect(evaluateFormula(formula)).toBe(-0);
    },
  );

  test("a name in a formula is read from the parsed names, minus its assignments and constants", () => {
    expect.hasAssertions();

    expect(getMathExpressionNames(parseNode("(x = col0 + 1) * x + col1 * pi"))).toStrictEqual(["col0", "col1"]);
  });
});

describe("counting and primality", () => {
  test("a count that overflows is infinite, without the loop running on", () => {
    expect.hasAssertions();

    expect(evaluateFormula("combinations(1000000000, 500000000)")).toBe(Number.POSITIVE_INFINITY);
    expect(evaluateFormula("permutations(1000000000, 500000000)")).toBe(Number.POSITIVE_INFINITY);
  });

  test("isPrime decides the safe integers, and is false for a non-integer", () => {
    expect.hasAssertions();

    expect(evaluateFormula("isPrime(9007199254740881)")).toBe(1);
    expect(evaluateFormula("isPrime(91)")).toBe(0);
    expect(evaluateFormula("isPrime(97)")).toBe(1);
    expect(evaluateFormula("isPrime(1.5)")).toBe(0);
  });

  test("a function reads two lists", () => {
    expect.hasAssertions();

    expect(evaluateFormula("dot([1, 2], [3, 4])")).toBe(11);
  });

  test("a list or a call past the engine's limit on spread arguments is read whole", () => {
    expect.hasAssertions();

    // The tree is built directly, since parsing a formula this long is the parser's cost and not the compiler's
    const ones: MathExpressionNode[] = Array.from({ length: 200_000 }, () => ({
      type: MathExpressionNodeType.Number,
      value: 1,
    }));
    const evaluateList = (name: string): number =>
      evaluateCall(name, [{ elements: ones, type: MathExpressionNodeType.List }]);

    expect(evaluateList("count")).toBe(200_000);
    expect(evaluateCall("sum", ones)).toBe(200_000);
    expect(evaluateList("max")).toBe(1);
    expect(evaluateCall("hypot", ones)).toBe(Math.sqrt(200_000));
  });

  test("a factorial is the product mathjs computes, to the last bit", () => {
    expect.hasAssertions();

    expect(evaluateFormula("30!")).toBe(2.6525285981219107e32);
    expect(evaluateFormula("100!")).toBe(9.332621544394414e157);
    expect(evaluateFormula("170!")).toBe(7.257415615307998e306);
  });

  test("compare orders a NaN operand before any number, as mathjs does", () => {
    expect.hasAssertions();

    expect(evaluateFormula("compare(0 / 0, 1)")).toBe(-1);
    expect(evaluateFormula("compare(1, 0 / 0)")).toBe(-1);
    expect(evaluateFormula("compareNatural(0 / 0, 1)")).toBe(-1);
  });

  test("isPrime is false above the safe integers, where every number is even", () => {
    expect.hasAssertions();

    expect(evaluateFormula("isPrime(9007199254740994)")).toBe(0);
    expect(evaluateFormula("isPrime(1e16)")).toBe(0);
  });
});
