import type { Node } from "oxc-parser";

export const checkIsCallTo = (statement: Node, calleeName: string, text: string): boolean =>
  statement.type === "ExpressionStatement" &&
  statement.expression.type === "CallExpression" &&
  text.slice(statement.expression.callee.start, statement.expression.callee.end) === calleeName;
