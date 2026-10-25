import ts from "typescript";

export const checkIsCallTo = (statement: ts.Statement, calleeName: string): boolean =>
  ts.isExpressionStatement(statement) &&
  ts.isCallExpression(statement.expression) &&
  statement.expression.expression.getText() === calleeName;
