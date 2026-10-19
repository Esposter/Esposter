import type { ModuleScopeConstant } from "#src/models/sweeps/constantScope/ModuleScopeConstant";

import { getDescendants } from "#src/services/sweeps/getDescendants";
import ts from "typescript";

const DESCRIBE_TODO_CALLEE = "describe.todo";
const HOISTED_CALLEE = "vi.hoisted";
const MOCK_CALLEE = "vi.mock";

interface Candidate {
  initializer?: ts.Expression;
  line: number;
  name: string;
}

const checkIsCallTo = (statement: ts.Statement, calleeName: string): boolean =>
  ts.isExpressionStatement(statement) &&
  ts.isCallExpression(statement.expression) &&
  statement.expression.expression.getText() === calleeName;

const checkIsExported = (statement: ts.VariableStatement): boolean =>
  (statement.modifiers ?? []).some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword);

// A function holds no state of its own, and a `vi.hoisted` block must stay at module scope, so neither is a constant to move
const checkIsMovable = (initializer: ts.Expression | undefined): boolean =>
  initializer === undefined ||
  (!ts.isArrowFunction(initializer) &&
    !ts.isFunctionExpression(initializer) &&
    !initializer.getText().includes(HOISTED_CALLEE));

const getIdentifierNames = (node: ts.Node): string[] =>
  getDescendants(node)
    .filter((descendant) => ts.isIdentifier(descendant))
    .map((identifier) => identifier.text);

// Module-scope state in a test file, which a sibling suite can reach and mutate: the `testing` skill's scope rule.
// A function and a hoisted `vi.hoisted` block are never candidates, and a constant only a module-scope helper reads
// Is still reported, since the helper moves into the describe with it. Kept out are a top-level await's fixture, a
// Binding a hoisted `vi.mock` factory reads, and whatever a destructuring's initializer reads. Each kept-out
// Constant keeps out what its own initializer reads, transitively, since the module scope pins those too.
export const getModuleScopeConstants = (text: string): ModuleScopeConstant[] => {
  const sourceFile = ts.createSourceFile("", text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const { statements } = sourceFile;
  // A helper file holds module state by design: it exports one helper and parks a `describe.todo` beside it
  if (statements.some((statement) => checkIsCallTo(statement, DESCRIBE_TODO_CALLEE))) return [];

  const candidates: Candidate[] = [];
  // The nodes whose identifiers pin what they name at module scope
  const pinningNodes: ts.Node[] = [];
  for (const statement of statements)
    if (checkIsCallTo(statement, MOCK_CALLEE)) pinningNodes.push(statement);
    else if (ts.isVariableStatement(statement) && !checkIsExported(statement))
      for (const declaration of statement.declarationList.declarations) {
        const { initializer } = declaration;
        if (!checkIsMovable(initializer)) continue;
        else if (initializer && getDescendants(initializer).some((node) => ts.isAwaitExpression(node)))
          pinningNodes.push(initializer);
        else if (ts.isIdentifier(declaration.name)) {
          const line = sourceFile.getLineAndCharacterOfPosition(statement.getStart(sourceFile)).line + 1;
          candidates.push({ initializer, line, name: declaration.name.text });
        }
        // A destructuring stays at module scope and reads its initializer there, so what it reads stays too
        else if (initializer) pinningNodes.push(initializer);
      }

  // A pinned constant pins what its own initializer reads, so the set is closed to a fixed point
  const pinnedNames = new Set(pinningNodes.flatMap((node) => getIdentifierNames(node)));
  let previousSize = -1;
  while (previousSize !== pinnedNames.size) {
    previousSize = pinnedNames.size;
    for (const { initializer, name } of candidates)
      if (initializer && pinnedNames.has(name))
        for (const identifierName of getIdentifierNames(initializer)) pinnedNames.add(identifierName);
  }
  return candidates.filter(({ name }) => !pinnedNames.has(name)).map(({ line, name }) => ({ line, name }));
};
