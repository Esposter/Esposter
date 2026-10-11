import type { TypeBenchSource } from "#src/models/benchTypes/TypeBenchSource";

import ts from "typescript";

// The file's exported type aliases are its cases, and every other statement is the header each case's program shares.
// The parser finds the cases, so a case written over several lines or holding a comment is cut whole.
export const readTypeBenchSource = (text: string): TypeBenchSource => {
  const sourceFile = ts.createSourceFile("typebench.ts", text, ts.ScriptTarget.Latest, true);
  const caseStatements = sourceFile.statements.filter(
    (statement): statement is ts.TypeAliasDeclaration =>
      ts.isTypeAliasDeclaration(statement) &&
      (statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword) ?? false),
  );
  // Cut from the last case back, so each cut leaves the offsets of the cases before it where they were
  let header = text;
  for (const caseStatement of caseStatements.toReversed())
    header = header.slice(0, caseStatement.getStart(sourceFile)) + header.slice(caseStatement.end);

  return {
    cases: caseStatements.map((caseStatement) => ({
      name: caseStatement.name.text,
      text: caseStatement.getText(sourceFile),
    })),
    header,
  };
};
