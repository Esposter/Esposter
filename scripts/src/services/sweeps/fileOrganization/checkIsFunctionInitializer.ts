import type { SyntaxNode } from "#src/models/syntax/SyntaxNode";

// A `const` or `let` holds a function when its initializer is one written in place, an arrow or a function expression,
// Never when it is a call that returns one
export const checkIsFunctionInitializer = (initializer: SyntaxNode | undefined): boolean =>
  initializer?.type === "ArrowFunctionExpression" || initializer?.type === "FunctionExpression";
