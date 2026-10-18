import { MAX_MATH_EXPRESSION_DEPTH } from "#src/services/constants";
import { parseMathExpression } from "#src/services/parseMathExpression";
import { describe, expect, test } from "vitest";

const getParseError = (formula: string): null | string =>
  parseMathExpression(formula).match(
    () => null,
    (error) => error.message,
  );

describe(parseMathExpression, () => {
  test.each([
    ["An unclosed parenthesis", "(1 + 2", /Parenthesis \) expected/u],
    ["An unknown function", "foo(1)", /Unknown function "foo"/u],
    ["A function given too many arguments", "round(1, 2, 3)", /"round" takes 1 or 2 arguments/u],
    ["A list given to a function that takes none", "sin([1])", /"sin" does not take a list argument/u],
    ["A list-only function given a single value", "count(5)", /"count" takes a list argument/u],
    ["A sign with no operand", "1 +", /Unexpected end of expression/u],
    ["A word size too small for its literal", "1 + 0x1FFi8", /String "0x1FF" is out of range \(char 5\)/u],
    ["A decimal point right after an exponent marker", "2e.5", /Digit expected, got "\." \(char 2\)/u],
    ["A decimal point right after an exponent sign", "2e+.5", /Digit expected, got "\." \(char 1\)/u],
    ["A decimal point after the digits of an exponent", "1e5.5", /Digit expected, got "\." \(char 1\)/u],
  ])("%s is an error", (_title, formula, message) => {
    expect.hasAssertions();

    expect(getParseError(formula)).toMatch(message);
  });

  test.each([["Nesting beyond the limit"]])("%s", (_title) => {
    expect.hasAssertions();

    const nested = `${"(".repeat(MAX_MATH_EXPRESSION_DEPTH + 1)}1${")".repeat(MAX_MATH_EXPRESSION_DEPTH + 1)}`;

    expect(getParseError(nested)).toMatch(/nests deeper than/u);
  });

  test("a formula of a few nested parentheses parses", () => {
    expect.hasAssertions();

    expect(getParseError("((1 + 2) * (3))")).toBeNull();
  });

  test("a non-breaking space between operands is whitespace, as a space is", () => {
    expect.hasAssertions();

    expect(getParseError("1 + 2")).toBeNull();
  });
});
