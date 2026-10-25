import ts from "typescript";

export const checkIsExported = (statement: ts.VariableStatement): boolean =>
  (statement.modifiers ?? []).some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword);
