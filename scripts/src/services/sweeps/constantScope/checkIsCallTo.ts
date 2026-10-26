import type { SyntaxNode } from "#src/models/syntax/SyntaxNode";

export const checkIsCallTo = (statement: SyntaxNode, calleeName: string, text: string): boolean =>
  statement.type === "ExpressionStatement" &&
  statement.expression.type === "CallExpression" &&
  text.slice(statement.expression.callee.start, statement.expression.callee.end) === calleeName;
