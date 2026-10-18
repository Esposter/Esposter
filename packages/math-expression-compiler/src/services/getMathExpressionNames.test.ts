import { getMathExpressionNames } from "#src/services/getMathExpressionNames";
import { parseMathExpression } from "#src/services/parseMathExpression";
import { describe, expect, test } from "vitest";

const getNamesOf = (formula: string): null | string[] =>
  parseMathExpression(formula).match(getMathExpressionNames, () => null);

describe(getMathExpressionNames, () => {
  test.each([
    ["A name read before its assignment is free", "x * (x = 2)", ["x"]],
    ["A name every branch assigns is bound", "(c ? (y = 1) : (y = 2)) + y", ["c"]],
    ["A name assigned before it is read is bound", "(x = 2) * x", []],
    ["A name only one branch assigns stays free", "(c ? (y = 1) : 0) + y", ["c", "y"]],
    ["A name assigned on the lazy right side of and stays free", "(c and (x = 2)) + x", ["c", "x"]],
    ["A name assigned on the lazy right side of a bitwise and stays free", "(c & (x = 2)) + x", ["c", "x"]],
  ])("%s", (_title, formula, names) => {
    expect.hasAssertions();

    expect(getNamesOf(formula)).toStrictEqual(names);
  });
});
