import type { MathExpressionCompileContext } from "#src/models/compiler/MathExpressionCompileContext";
import type { MathExpressionCompiledArgument } from "#src/models/compiler/MathExpressionCompiledArgument";
import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";

// A list argument yields the numbers of its elements, and any element that is an error makes the list one
export const compileList = (
  elements: MathExpressionNode[],
  context: MathExpressionCompileContext,
): MathExpressionCompiledArgument => {
  const compiledElements = elements.map((element) => context.compile(element));
  return {
    evaluate: (values, locals) => {
      const numbers: number[] = [];
      for (const element of compiledElements) {
        const elementValue = element.evaluate(values, locals);
        if (elementValue === null) return null;
        numbers.push(elementValue);
      }
      return numbers;
    },
    isConstant: compiledElements.every((element) => element.isConstant),
  };
};
