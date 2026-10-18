import type { MathExpressionCompiled } from "#src/models/compiler/MathExpressionCompiled";

// A list is only a call's argument, which compileCall reads as numbers, and the parser refuses it anywhere else
export const compileListNode = (): MathExpressionCompiled => ({ evaluate: () => null, isConstant: false });
