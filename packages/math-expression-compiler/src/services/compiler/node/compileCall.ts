import type { MathExpressionCompileContext } from "#src/models/compiler/MathExpressionCompileContext";
import type { MathExpressionCompiled } from "#src/models/compiler/MathExpressionCompiled";
import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";
import type { MathExpressionNodeType } from "#src/models/shared/MathExpressionNodeType";
import type { MathExpressionValue } from "#src/models/function/MathExpressionValue";

import { compileArgument } from "#src/services/compiler/compileArgument";
import { getMathExpressionParameterType } from "#src/services/shared/getMathExpressionParameterType";
import { getMathExpressionSignatures } from "#src/services/shared/getMathExpressionSignatures";
import { matchMathExpressionSignature } from "#src/services/shared/matchMathExpressionSignature";

// A call of one or two arguments hands its values straight to its function, and a longer call gathers them in a loop.
// The signature a call takes is the one its argument kinds match, the same one the parser checked it against
export const compileCall = (
  node: Extract<MathExpressionNode, { type: MathExpressionNodeType.Call }>,
  context: MathExpressionCompileContext,
): MathExpressionCompiled => {
  const signatures = getMathExpressionSignatures(node.name);
  const parameterTypes = node.arguments.map((argument) => getMathExpressionParameterType(argument));
  const signature = matchMathExpressionSignature(signatures ?? [], parameterTypes);
  const compute = signature?.compute ?? (() => null);
  const computeUnary = signature?.computeUnary;
  const computeBinary = signature?.computeBinary;
  const compiledArguments = node.arguments.map((argument) => compileArgument(argument, context));
  const isConstant = compiledArguments.every((argument) => argument.isConstant);
  const [first, second] = compiledArguments;
  if (compiledArguments.length === 1 && first !== undefined)
    return {
      evaluate: (values, locals) => {
        const firstValue = first.evaluate(values, locals);
        if (firstValue === null) return null;
        // A scalar form takes only a number, so any other value goes through the array form
        if (computeUnary !== undefined && typeof firstValue === "number") return computeUnary(firstValue);

        return compute([firstValue]);
      },
      isConstant,
    };

  if (compiledArguments.length === 2 && first !== undefined && second !== undefined)
    return {
      evaluate: (values, locals) => {
        const firstValue = first.evaluate(values, locals);
        if (firstValue === null) return null;
        const secondValue = second.evaluate(values, locals);
        if (secondValue === null) return null;
        if (computeBinary !== undefined && typeof firstValue === "number" && typeof secondValue === "number")
          return computeBinary(firstValue, secondValue);

        return compute([firstValue, secondValue]);
      },
      isConstant,
    };

  return {
    evaluate: (values, locals) => {
      const argumentValues: MathExpressionValue[] = [];
      for (const argument of compiledArguments) {
        const argumentValue = argument.evaluate(values, locals);
        if (argumentValue === null) return null;
        argumentValues.push(argumentValue);
      }
      return compute(argumentValues);
    },
    isConstant,
  };
};
