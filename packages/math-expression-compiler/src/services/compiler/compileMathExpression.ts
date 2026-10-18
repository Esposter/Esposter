import type { MathExpressionCompileContext } from "#src/models/compiler/MathExpressionCompileContext";
import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";
import type { MathExpressionOuterBinding } from "#src/models/compiler/MathExpressionOuterBinding";

import { collectMathExpressionAssignedNames } from "#src/services/compiler/collectMathExpressionAssignedNames";
import { compileMathExpressionNode } from "#src/services/compiler/compileMathExpressionNode";
import { NO_LOCALS } from "#src/services/compiler/constants";
import { getMathExpressionConstant } from "#src/services/compiler/getMathExpressionConstant";
import { readMathExpressionOuterValue } from "#src/services/compiler/readMathExpressionOuterValue";

// Compiles a parsed formula into a function of the values of the variables named by `variableNames`, in that order.
// A name the formula reads that is neither a variable, an assignment nor a constant is an error, which the function yields as NaN.
// Each call starts every assigned name at its outer value, as mathjs reads it until the assignment runs
export const compileMathExpression = (
  node: MathExpressionNode,
  variableNames: readonly string[],
): ((values: readonly number[]) => number) => {
  const assignedNames = new Set<string>();
  collectMathExpressionAssignedNames(node, assignedNames);
  const assignedSlots = new Map(Array.from(assignedNames, (name, slot): [string, number] => [name, slot]));
  const variableIndices = new Map(variableNames.map((name, index): [string, number] => [name, index]));
  const context: MathExpressionCompileContext = {
    assignedSlots,
    compile: (child) => compileMathExpressionNode(child, context),
    variableIndices,
  };
  const compiled = context.compile(node);
  const outerBindings: MathExpressionOuterBinding[] = Array.from(assignedNames, (name) => ({
    constant: getMathExpressionConstant(name),
    variableIndex: variableIndices.get(name),
  }));

  return (values) => {
    const locals =
      outerBindings.length === 0
        ? NO_LOCALS
        : outerBindings.map((outer) => readMathExpressionOuterValue(outer, values));
    return compiled.evaluate(values, locals) ?? Number.NaN;
  };
};
