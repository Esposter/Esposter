import type { MathExpressionNode } from "#src/models/MathExpressionNode";

import { compileMathExpression } from "#src/services/compileMathExpression";
import { getMathExpressionNames } from "#src/services/getMathExpressionNames";
import { parseMathExpression } from "#src/services/parseMathExpression";
import { describe, expect, test } from "vitest";

const SCOPE = { col0: 3, col1: -2.5 };

const parseNode = (formula: string): MathExpressionNode =>
  parseMathExpression(formula).match(
    (node) => node,
    (error) => {
      throw error;
    },
  );

const evaluateFormula = (formula: string, scope: Record<string, number> = {}): number =>
  compileMathExpression(parseNode(formula), Object.keys(scope))(Object.values(scope));

describe(compileMathExpression, () => {
  test.each([
    ["Power binds tighter than a sign", "-2 ^ 2", {}, -4],
    ["Modulo takes the sign of the divisor", "-7 % 3", {}, 2],
    ["A trailing percent sign is a percentage of the left side", "100 + 3%", {}, 103],
    ["A name beside a number multiplies it", "2 col0", SCOPE, 6],
    ["Rounding goes half away from zero", "round(-2.5)", {}, -3],
    ["A bare comparison has a value", "col0 > 3", { col0: 5 }, 1],
    ["A chained comparison holds only when each pair does", "1 < 3 < 2", {}, 0],
    ["A prototype member's name is unknown", "constructor", {}, Number.NaN],
    ["A name that is no column is an error", "unknownName + 1", {}, Number.NaN],
    ["A name read before its assignment with no outer value is an error", "x + (x = 1)", {}, Number.NaN],
    ["An assignment is read back by the formula", "(x = col0 + 1) * x", SCOPE, 16],
    ["A variable reads its outer value until its assignment runs", "x * (x = 2)", { x: 3 }, 6],
    ["A constant reads its value until its assignment runs", "pi * (pi = 1)", {}, Math.PI],
    [
      "The log gamma of infinity is infinite, as the gamma function is",
      "lgamma(Infinity)",
      {},
      Number.POSITIVE_INFINITY,
    ],
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

  test("a name in a formula is read from the parsed names, minus its assignments and constants", () => {
    expect.hasAssertions();

    expect(getMathExpressionNames(parseNode("(x = col0 + 1) * x + col1 * pi"))).toStrictEqual(["col0", "col1"]);
  });
});

describe("defect fixes", () => {
  test("#3563 a percentage followed by a sum is a percentage", () => {
    expect.hasAssertions();

    expect(evaluateFormula("100*25% + 2")).toBe(27);
    expect(evaluateFormula("10 % +3")).toBe(10 / 100 + 3);
    expect(evaluateFormula("7 % -3")).toBe(7 / 100 - 3);
  });

  test("#2851 a sum of percentages adds the plain values", () => {
    expect.hasAssertions();

    expect(evaluateFormula("10% + 20%")).toBe(10 / 100 + 20 / 100);
    expect(evaluateFormula("25% + 25%")).toBe(0.5);
  });

  test("#3282 a chain of percentage sums adds the plain values", () => {
    expect.hasAssertions();

    expect(evaluateFormula("10% + 20% + 30%")).toBe(10 / 100 + 20 / 100 + 30 / 100);
  });

  test("#204 a percentage after a plain sum is of the sum's left side", () => {
    expect.hasAssertions();

    expect(evaluateFormula("100 + 10% + 20%")).toBe(132);
  });

  test("#513 a quotient that is an exact multiple gives a zero modulo", () => {
    expect.hasAssertions();

    expect(evaluateFormula("mod(10.8, 1.2)")).toBe(0);
    expect(evaluateFormula("10.8 % 1.2")).toBe(0);
  });

  test("#2936 a decimal modulo that is an exact multiple is zero", () => {
    expect.hasAssertions();

    expect(evaluateFormula("0.3 mod 0.1")).toBe(0);
    expect(evaluateFormula("mod(0.15, 0.05)")).toBe(0);
  });

  test("#2374 a radix prefix with no digit is a zero, and the letter after it a name", () => {
    expect.hasAssertions();

    expect(evaluateFormula("(x = 3) + 0x")).toBe(3);
  });

  test("#3421 a binary literal reads only its radix digits", () => {
    expect.hasAssertions();

    expect(evaluateFormula("(x = 4) + 0b1x")).toBe(8);
    expect(evaluateFormula("0x1F")).toBe(31);
    expect(evaluateFormula("0x1F.8")).toBe(31.5);
    expect(evaluateFormula("0b11i8")).toBe(3);
    expect(evaluateFormula("0xFFi8")).toBe(-1);
  });

  test("#2483 and, or and xor take any number of arguments", () => {
    expect.hasAssertions();

    expect(evaluateFormula("and(1, 1, 0)")).toBe(0);
    expect(evaluateFormula("or(0, 0, 1)")).toBe(1);
    expect(evaluateFormula("xor(1, 1, 1)")).toBe(1);
    expect(evaluateFormula("xor(1, 1)")).toBe(0);
  });

  test("#2464 an exact root of a perfect power is exact", () => {
    expect.hasAssertions();

    expect(evaluateFormula("nthRoot(125, 3)")).toBe(5);
  });

  test("#2967 coth, csch and sech are the reciprocals of tanh, sinh and cosh", () => {
    expect.hasAssertions();

    expect(evaluateFormula("coth(1e-7)")).toBe(10000000.000000035);
    expect(evaluateFormula("sech(0)")).toBe(1);
  });

  test("#2011 erfinv inverts erf", () => {
    expect.hasAssertions();

    expect(evaluateFormula("erfinv(0.5)")).toBeCloseTo(0.4769362762044699, 14);
    expect(evaluateFormula("erf(erfinv(0.25))")).toBeCloseTo(0.25, 14);
    expect(evaluateFormula("erfinv(erf(0.3))")).toBeCloseTo(0.3, 14);
  });
});

describe("counting and primality", () => {
  test("a count that overflows is infinite, without the loop running on", () => {
    expect.hasAssertions();

    expect(evaluateFormula("combinations(1000000000, 500000000)")).toBe(Number.POSITIVE_INFINITY);
    expect(evaluateFormula("permutations(1000000000, 500000000)")).toBe(Number.POSITIVE_INFINITY);
    expect(evaluateFormula("bellNumbers(300)")).toBe(Number.POSITIVE_INFINITY);
    expect(evaluateFormula("bernoulli(300)")).toBe(Number.NEGATIVE_INFINITY);
  });

  test("isPrime decides the safe integers, and is false for a non-integer", () => {
    expect.hasAssertions();

    expect(evaluateFormula("isPrime(9007199254740881)")).toBe(1);
    expect(evaluateFormula("isPrime(91)")).toBe(0);
    expect(evaluateFormula("isPrime(97)")).toBe(1);
    expect(evaluateFormula("isPrime(1.5)")).toBe(0);
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
