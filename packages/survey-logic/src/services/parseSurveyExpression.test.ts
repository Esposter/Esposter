import type { SurveyExpressionNode } from "#src/models/SurveyExpressionNode";

import { SurveyExpressionBinaryOperator } from "#src/models/SurveyExpressionBinaryOperator";
import { SurveyExpressionNodeType } from "#src/models/SurveyExpressionNodeType";
import { parseSurveyExpression } from "#src/services/parseSurveyExpression";
import { exhaustiveGuard, noop } from "@esposter/shared";
import { ok } from "neverthrow";
import { describe, expect, test } from "vitest";

// The tree as nested calls, each operator and unary named by its enum value, so a case reads its grouping at a glance
const getShape = (node: SurveyExpressionNode): string => {
  switch (node.type) {
    case SurveyExpressionNodeType.Binary:
      return `${node.operator}(${getShape(node.left)}, ${getShape(node.right)})`;
    case SurveyExpressionNodeType.Call:
      return `${node.name}(${node.args.map((argument) => getShape(argument)).join(", ")})`;
    case SurveyExpressionNodeType.List:
      return `[${node.items.map((item) => getShape(item)).join(", ")}]`;
    case SurveyExpressionNodeType.Literal:
      return JSON.stringify(node.value);
    case SurveyExpressionNodeType.Reference:
      return `{${node.name}}`;
    case SurveyExpressionNodeType.Unary:
      return `${node.operator}(${getShape(node.operand)})`;
    default:
      return exhaustiveGuard(node);
  }
};

// A fault comes back as it is, so a mismatch shows the fault rather than an undefined shape
const getShapeOf = (source: string) =>
  parseSurveyExpression(source).match(
    (node) => getShape(node),
    (error) => error,
  );

const getParseError = (source: string) => parseSurveyExpression(source).match(noop, (error) => error);

describe(parseSurveyExpression, () => {
  test.each([
    ["a whole number", "12", "12"],
    ["a number with a leading dot", ".5", "0.5"],
    ["a boolean in any case", "False", "false"],
    ["a string in double quotes", `"Ada"`, `"Ada"`],
    ["a string escaping its quote", String.raw`'it\'s'`, `"it's"`],
    ["a reference with dots and spaces", "{panel.first name}", "{panel.first name}"],
    ["a list of mixed items", "[1, 'a', {b}]", `[1, "a", {b}]`],
    ["an empty list", "[]", "[]"],
    ["a list item that is an expression", "[1 + 1]", "[add(1, 1)]"],
    ["a call with arguments", "round({a}, 2)", "round({a}, 2)"],
    ["a call with no arguments", "now()", "now()"],
    ["a call nested in a call", "sum(round({a}), 2)", "sum(round({a}), 2)"],
    ["a call to a name no function has", "nosuchfunction({age})", "nosuchfunction({age})"],
    ["a group that overrides precedence", "(1 + 2) * 3", "multiply(add(1, 2), 3)"],
    ["a unary minus", "-{a}", "negate({a})"],
  ])("%s parses to %s", (_title, source, shape) => {
    expect.hasAssertions();

    expect(getShapeOf(source)).toBe(shape);
  });

  test.each([
    ["{a} or {b}", "or({a}, {b})"],
    ["{a} || {b}", "or({a}, {b})"],
    ["{a} and {b}", "and({a}, {b})"],
    ["{a} && {b}", "and({a}, {b})"],
    ["not {a}", "not({a})"],
    ["!{a}", "not({a})"],
    ["{a} = 1", "equal({a}, 1)"],
    ["{a} == 1", "equal({a}, 1)"],
    ["{a} != 1", "notEqual({a}, 1)"],
    ["{a} <> 1", "notEqual({a}, 1)"],
    ["{a} < 1", "less({a}, 1)"],
    ["{a} <= 1", "lessOrEqual({a}, 1)"],
    ["{a} > 1", "greater({a}, 1)"],
    ["{a} >= 1", "greaterOrEqual({a}, 1)"],
    ["{a} contains 'x'", `contains({a}, "x")`],
    ["{a} notcontains 'x'", `notContains({a}, "x")`],
    ["{a} anyof [1]", "anyOf({a}, [1])"],
    ["{a} allof [1]", "allOf({a}, [1])"],
    ["{a} empty", "empty({a})"],
    ["{a} notempty", "notEmpty({a})"],
    ["1 + 2", "add(1, 2)"],
    ["1 - 2", "subtract(1, 2)"],
    ["1 * 2", "multiply(1, 2)"],
    ["1 / 2", "divide(1, 2)"],
    ["1 % 2", "modulo(1, 2)"],
    ["2 ^ 3", "power(2, 3)"],
  ])("%s reads as %s", (source, shape) => {
    expect.hasAssertions();

    expect(getShapeOf(source)).toBe(shape);
  });

  // A higher power binds tighter, and a chain of one operator groups to the left, the power included
  test.each([
    ["1 + 2 * 3", "add(1, multiply(2, 3))"],
    ["1 * 2 + 3", "add(multiply(1, 2), 3)"],
    ["1 - 2 - 3", "subtract(subtract(1, 2), 3)"],
    ["2 ^ 3 ^ 2", "power(power(2, 3), 2)"],
    ["2 ^ 3 * 2", "multiply(power(2, 3), 2)"],
    ["-2 ^ 2", "power(negate(2), 2)"],
    ["2 ^ -2", "power(2, negate(2))"],
    ["not {a} = 1", "not(equal({a}, 1))"],
    ["not {a} and {b}", "and(not({a}), {b})"],
    ["{a} = 1 or {b} = 2 and {c} = 3", "or(equal({a}, 1), and(equal({b}, 2), equal({c}, 3)))"],
    ["{a} + 1 = 2", "equal(add({a}, 1), 2)"],
    ["{a} empty = true", "equal(empty({a}), true)"],
    ["not {a} empty", "not(empty({a}))"],
    ["{a} AND NOT {b} OR {c} NotEmpty", "or(and({a}, not({b})), notEmpty({c}))"],
  ])("%s groups as %s", (source, shape) => {
    expect.hasAssertions();

    expect(getShapeOf(source)).toBe(shape);
  });

  test("a node is positioned at the token that makes it", () => {
    expect.hasAssertions();

    expect(parseSurveyExpression("{a} + 1")).toStrictEqual(
      ok({
        left: { name: "a", position: 0, type: SurveyExpressionNodeType.Reference },
        operator: SurveyExpressionBinaryOperator.Add,
        position: 4,
        right: { position: 6, type: SurveyExpressionNodeType.Literal, value: 1 },
        type: SurveyExpressionNodeType.Binary,
      }),
    );
  });

  test.each([
    ["an unclosed parenthesis", "({age} > 5", "Expected ) to close the parenthesis opened here", 10],
    ["an unclosed string", "'abc", "Expected ' to close the string opened here", 4],
    ["an unclosed reference", "{age", "Expected } to close the reference opened here", 4],
    ["an empty source", "", "Expected an expression", 0],
    ["a source of spaces alone", "   ", "Expected an expression", 3],
    ["a token after a complete expression", "1 2", "Expected the end of the expression", 2],
    ["a closing parenthesis with no opening one", "1)", "Expected the end of the expression", 1],
    ["a bare operator", "* 2", "Expected an expression", 0],
    ["an operator with no right operand", "1 +", "Expected an expression", 3],
    ["empty parentheses", "()", "Expected an expression", 1],
    ["a keyword where an operand is expected", "and {a}", "Expected an expression", 0],
    ["a name with no parentheses", "age > 5", "Expected ( after age", 4],
    ["an unclosed list", "[1, 2", "Expected , or ] to close the list opened here", 5],
    ["a list with a trailing comma", "[1,]", "Expected an expression", 3],
    ["a call missing its comma", "round(1 2)", "Expected , or ) to close the call opened here", 8],
    ["a character no token starts with", "{a} & {b}", "Unexpected character &", 4],
    ["an empty reference", "{}", "Expected a question name between { and }", 1],
  ])("%s is an error at its position", (_title, source, message, position) => {
    expect.hasAssertions();

    expect(getParseError(source)).toStrictEqual({ message, position });
  });
});
