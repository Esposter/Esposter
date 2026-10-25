import type { ModuleScopeConstant } from "#src/models/sweeps/constantScope/ModuleScopeConstant";

import { checkIsCallTo } from "#src/services/sweeps/constantScope/checkIsCallTo";
import { checkIsExported } from "#src/services/sweeps/constantScope/checkIsExported";
import { checkIsMovable } from "#src/services/sweeps/constantScope/checkIsMovable";
import { DESCRIBE_TODO_CALLEE, MOCK_CALLEE } from "#src/services/sweeps/constantScope/constants";
import { getIdentifierNames } from "#src/services/sweeps/constantScope/getIdentifierNames";
import { getDescendants } from "#src/services/sweeps/getDescendants";
import ts from "typescript";

// Module-scope state in a test file, which a sibling suite can reach and mutate: the `testing` skill's scope rule.
// A function and a hoisted `vi.hoisted` block are never candidates, and a constant only a module-scope helper reads
// Is still reported, since the helper moves into the describe with it. Kept out are a top-level await's fixture, a
// Binding a hoisted `vi.mock` factory reads, and whatever a destructuring's initializer reads. Each kept-out name keeps
// Out what its initializer reads, a function's body included, transitively, since the module scope pins those too.
export const getModuleScopeConstants = (text: string): ModuleScopeConstant[] => {
  const sourceFile = ts.createSourceFile("", text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const { statements } = sourceFile;
  // A helper file holds module state by design: it exports one helper and parks a `describe.todo` beside it
  if (statements.some((statement) => checkIsCallTo(statement, DESCRIBE_TODO_CALLEE))) return [];

  const candidates: ModuleScopeConstant[] = [];
  // What each module-scope name reads, its initializer or a function declaration's body, keyed by the name
  const initializerMap = new Map<string, ts.Node>();
  // The nodes whose identifiers pin what they name at module scope
  const pinningNodes: ts.Node[] = [];
  for (const statement of statements)
    if (checkIsCallTo(statement, MOCK_CALLEE)) pinningNodes.push(statement);
    else if (ts.isVariableStatement(statement) && !checkIsExported(statement))
      for (const declaration of statement.declarationList.declarations) {
        const { initializer } = declaration;
        if (initializer && ts.isIdentifier(declaration.name)) initializerMap.set(declaration.name.text, initializer);
        if (!checkIsMovable(initializer)) continue;
        else if (initializer && getDescendants(initializer).some((node) => ts.isAwaitExpression(node)))
          pinningNodes.push(initializer);
        else if (ts.isIdentifier(declaration.name)) {
          const line = sourceFile.getLineAndCharacterOfPosition(statement.getStart(sourceFile)).line + 1;
          candidates.push({ line, name: declaration.name.text });
        }
        // A destructuring stays at module scope and reads its initializer there, so what it reads stays too
        else if (initializer) pinningNodes.push(initializer);
      }
    else if (ts.isFunctionDeclaration(statement) && statement.name && statement.body)
      initializerMap.set(statement.name.text, statement.body);

  // A pinned name pins what its initializer or function body reads, so the set is closed to a fixed point
  const pinnedNames = new Set(pinningNodes.flatMap((node) => getIdentifierNames(node)));
  let previousSize = -1;
  while (previousSize !== pinnedNames.size) {
    previousSize = pinnedNames.size;
    for (const [name, initializer] of initializerMap)
      if (pinnedNames.has(name))
        for (const identifierName of getIdentifierNames(initializer)) pinnedNames.add(identifierName);
  }
  return candidates.filter(({ name }) => !pinnedNames.has(name));
};
