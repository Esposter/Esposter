import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { SurveyExpressionBinaryOperator } from "#src/models/SurveyExpressionBinaryOperator";
import { evaluateArithmeticOperator } from "#src/services/evaluator/operators/evaluateArithmeticOperator";
import { describe, expect, test } from "vitest";

type ArithmeticOperator = Parameters<typeof evaluateArithmeticOperator>[0];

describe(evaluateArithmeticOperator, () => {
  // Arithmetic reads each operand as a number: a number, or a text that is a plain decimal once trimmed.
  // An operand that reads as none has no result, and so does a division by zero.
  // The one exception is `+`, which joins two non-empty texts neither of which reads as a number
  test.each<[string, ArithmeticOperator, SurveyLogicValue, SurveyLogicValue, SurveyLogicValue]>([
    ["two numeric texts add", SurveyExpressionBinaryOperator.Add, "2", "3", 5],
    ["a numeric text adds to a number", SurveyExpressionBinaryOperator.Add, "2.5", 1, 3.5],
    ["an unreadable text has no sum with a number", SurveyExpressionBinaryOperator.Add, "a", 1, undefined],
    ["a boolean has no sum with a number", SurveyExpressionBinaryOperator.Add, true, 1, undefined],
    ["an empty text has no sum with a number", SurveyExpressionBinaryOperator.Add, "", 5, undefined],
    ["two texts that are not numbers join", SurveyExpressionBinaryOperator.Add, "a", "b", "ab"],
    ["a division by zero has no result", SurveyExpressionBinaryOperator.Divide, 5, 0, undefined],
    ["a leading-zero text reads as its number", SurveyExpressionBinaryOperator.Add, "007", 1, 8],
    ["a decimal sum keeps its decimals", SurveyExpressionBinaryOperator.Add, "1.25", 0.5, 1.75],
  ])("%s", (_title, operator, left, right, expected) => {
    expect.hasAssertions();

    expect(evaluateArithmeticOperator(operator, left, right)).toStrictEqual(expected);
  });
});
