import type { TypeBenchSource } from "#src/models/benchTypes/TypeBenchSource";

import { parseSource } from "#src/services/shared/parseSource";

// The file's exported type aliases are its cases, and every other statement is the header each case's program shares.
// The parser finds the cases, so a case written over several lines or holding a comment is cut whole.
export const readTypeBenchSource = (text: string): TypeBenchSource => {
  const caseStatements = parseSource(text).body.flatMap((statement) =>
    statement.type === "ExportNamedDeclaration" && statement.declaration?.type === "TSTypeAliasDeclaration"
      ? [{ end: statement.end, name: statement.declaration.id.name, start: statement.start }]
      : [],
  );
  // Cut from the last case back, so each cut leaves the offsets of the cases before it where they were
  let header = text;
  for (const caseStatement of caseStatements.toReversed())
    header = header.slice(0, caseStatement.start) + header.slice(caseStatement.end);

  return {
    cases: caseStatements.map((caseStatement) => ({
      name: caseStatement.name,
      text: text.slice(caseStatement.start, caseStatement.end),
    })),
    header,
  };
};
