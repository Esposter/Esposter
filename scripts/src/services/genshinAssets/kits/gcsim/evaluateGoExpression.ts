import type { GoExpression } from "#src/models/genshinAssets/kits/gcsim/GoExpression";
import type { GoOperand } from "#src/models/genshinAssets/kits/gcsim/GoOperand";
import type { GoValue } from "#src/models/genshinAssets/kits/gcsim/GoValue";

import { GoExpressionKind } from "#src/models/genshinAssets/kits/gcsim/GoExpressionKind";
import { GCSIM_ABILITY_FRAMES_CALLEE, GCSIM_NORMAL_FRAMES_CALLEE } from "#src/services/genshinAssets/kits/constants";
import { checkIsGoFloat } from "#src/services/genshinAssets/kits/gcsim/checkIsGoFloat";
import { readGoNumber } from "#src/services/genshinAssets/kits/gcsim/readGoNumber";
import { toGoNumberValue } from "#src/services/genshinAssets/kits/gcsim/toGoNumberValue";
import { exhaustiveGuard } from "@esposter/shared";

const CONVERSION_CALLEES = new Set(["float64", "int"]);

const readOperand = (value: GoValue | undefined): GoOperand | undefined => {
  const number = readGoNumber(value);
  return number === undefined
    ? undefined
    : { isFloat: checkIsGoFloat(value) || !Number.isInteger(number), value: number };
};

const applyOperator = (operator: string, left: GoOperand, right: GoOperand): GoValue | undefined => {
  const isFloat = left.isFloat || right.isFloat;
  let value: number;
  if (operator === "+") value = left.value + right.value;
  else if (operator === "-") value = left.value - right.value;
  else if (operator === "*") value = left.value * right.value;
  // Two whole numbers divide as Go's integers do, truncating, and a float operand keeps the fraction
  else if (operator === "/") value = isFloat ? left.value / right.value : Math.trunc(left.value / right.value);
  else if (operator === "%") value = left.value % right.value;
  else return undefined;
  return toGoNumberValue(value, isFloat);
};

// A Go expression's value as gcsim's action files compute their hitmarks and frames: numbers and their sums, slices,
// Indexes into them, the frame helpers and the numeric conversions, each name read through the package's constants.
// Anything else, a call into the simulation or a name the package does not define, has no value
export const evaluateGoExpression = (
  expression: GoExpression,
  resolveName: (name: string) => GoValue | undefined,
): GoValue | undefined => {
  const evaluate = (operand: GoExpression) => evaluateGoExpression(operand, resolveName);
  switch (expression.kind) {
    case GoExpressionKind.Binary: {
      const left = readOperand(evaluate(expression.left));
      const right = readOperand(evaluate(expression.right));
      return left !== undefined && right !== undefined ? applyOperator(expression.operator, left, right) : undefined;
    }
    case GoExpressionKind.Call: {
      const parameters = expression.parameters.map((parameter) => evaluate(parameter));
      const [first, second] = parameters;
      const firstNumber = readGoNumber(first);
      const secondNumber = readGoNumber(second);
      if (expression.callee === GCSIM_NORMAL_FRAMES_CALLEE)
        return firstNumber !== undefined && secondNumber !== undefined
          ? { animationFrames: secondNumber, hitmarkFrames: firstNumber }
          : undefined;
      else if (expression.callee === GCSIM_ABILITY_FRAMES_CALLEE)
        return firstNumber === undefined ? undefined : { animationFrames: firstNumber };
      // A float64 conversion makes its number a float, and an int one a whole number, as Go's conversions do
      else if (CONVERSION_CALLEES.has(expression.callee) && parameters.length === 1)
        return firstNumber === undefined
          ? first
          : expression.callee === "float64"
            ? toGoNumberValue(firstNumber, true)
            : firstNumber;
      else if (expression.callee === "make") return [];
      else return undefined;
    }
    case GoExpressionKind.Composite: {
      const elements = expression.elements.map((element) => evaluate(element));
      return elements.every((element) => element !== undefined) ? elements : undefined;
    }
    case GoExpressionKind.Identifier:
      return resolveName(expression.name);
    case GoExpressionKind.Index: {
      const target = evaluate(expression.target);
      const index = readGoNumber(evaluate(expression.index));
      return Array.isArray(target) && index !== undefined ? target[index] : undefined;
    }
    case GoExpressionKind.Number:
      return toGoNumberValue(expression.value, expression.isFloat);
    case GoExpressionKind.String:
    case GoExpressionKind.Unknown:
      return undefined;
    case GoExpressionKind.Unary: {
      const operand = evaluate(expression.operand);
      const number = readGoNumber(operand);
      if (number === undefined) return undefined;
      return toGoNumberValue(expression.operator === "-" ? -number : number, checkIsGoFloat(operand));
    }
    default:
      return exhaustiveGuard(expression);
  }
};
