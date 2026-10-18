import ts from "typescript";

// A `const` or `let` holds a function when its initializer is one written in place, an arrow or a function expression,
// Never when it is a call that returns one
export const checkIsFunctionInitializer = (initializer: ts.Expression | undefined): boolean =>
  initializer !== undefined && (ts.isArrowFunction(initializer) || ts.isFunctionExpression(initializer));
