import type { GoExpression } from "#src/models/genshinAssets/kits/gcsim/GoExpression";
import type { GoValue } from "#src/models/genshinAssets/kits/gcsim/GoValue";

import { GoExpressionKind } from "#src/models/genshinAssets/kits/gcsim/GoExpressionKind";
import { GCSIM_ABILITY_FRAMES_CALLEE, GCSIM_NORMAL_FRAMES_CALLEE } from "#src/services/genshinAssets/kits/constants";
import { exhaustiveGuard } from "@esposter/shared";

const CONVERSION_CALLEES = new Set(["float64", "int"]);

const applyOperator = (operator: string, left: number, right: number): number | undefined => {
  if (operator === "+") return left + right;
  else if (operator === "-") return left - right;
  else if (operator === "*") return left * right;
  else if (operator === "/")
    return Number.isInteger(left) && Number.isInteger(right) ? Math.trunc(left / right) : left / right;
  else if (operator === "%") return left % right;
  return undefined;
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
      const left = evaluate(expression.left);
      const right = evaluate(expression.right);
      return typeof left === "number" && typeof right === "number"
        ? applyOperator(expression.operator, left, right)
        : undefined;
    }
    case GoExpressionKind.Call: {
      const parameters = expression.parameters.map((parameter) => evaluate(parameter));
      const [first, second] = parameters;
      if (expression.callee === GCSIM_NORMAL_FRAMES_CALLEE)
        return typeof first === "number" && typeof second === "number"
          ? { animationFrames: second, hitmarkFrames: first }
          : undefined;
      else if (expression.callee === GCSIM_ABILITY_FRAMES_CALLEE)
        return typeof first === "number" ? { animationFrames: first } : undefined;
      else if (CONVERSION_CALLEES.has(expression.callee) && parameters.length === 1) return first;
      else if (expression.callee === "make") return [];
      return undefined;
    }
    case GoExpressionKind.Composite: {
      const elements = expression.elements.map((element) => evaluate(element));
      return elements.every((element) => element !== undefined) ? elements : undefined;
    }
    case GoExpressionKind.Identifier:
      return resolveName(expression.name);
    case GoExpressionKind.Index: {
      const target = evaluate(expression.target);
      const index = evaluate(expression.index);
      return Array.isArray(target) && typeof index === "number" ? target[index] : undefined;
    }
    case GoExpressionKind.Number:
      return expression.value;
    case GoExpressionKind.String:
    case GoExpressionKind.Unknown:
      return undefined;
    case GoExpressionKind.Unary: {
      const operand = evaluate(expression.operand);
      if (typeof operand !== "number") return undefined;
      return expression.operator === "-" ? -operand : operand;
    }
    default:
      return exhaustiveGuard(expression);
  }
};
