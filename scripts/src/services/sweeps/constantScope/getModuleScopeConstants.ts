import type { ModuleScopeConstant } from "#src/models/sweeps/constantScope/ModuleScopeConstant";
import type { SyntaxNode } from "#src/models/syntax/SyntaxNode";

import { parseSource } from "#src/services/shared/parseSource";
import { checkIsCallTo } from "#src/services/sweeps/constantScope/checkIsCallTo";
import { checkIsMovable } from "#src/services/sweeps/constantScope/checkIsMovable";
import { DESCRIBE_TODO_CALLEE, MOCK_CALLEE } from "#src/services/sweeps/constantScope/constants";
import { getIdentifierNames } from "#src/services/sweeps/constantScope/getIdentifierNames";
import { getDescendants } from "#src/services/sweeps/getDescendants";

// Module-scope state in a test file, which a sibling suite can reach and mutate: the `testing` skill's scope rule.
// A function and a hoisted `vi.hoisted` block are never candidates, and a constant only a module-scope helper reads
// Is still reported, since the helper moves into the describe with it. Kept out are a top-level await's fixture, a
// Binding a hoisted `vi.mock` factory reads, and whatever a destructuring's initializer reads. Each kept-out name keeps
// Out what its initializer reads, a function's body included, transitively, since the module scope pins those too.
export const getModuleScopeConstants = (text: string): ModuleScopeConstant[] => {
  const { body: statements } = parseSource(text);
  // A helper file holds module state by design: it exports one helper and parks a `describe.todo` beside it
  if (statements.some((statement) => checkIsCallTo(statement, DESCRIBE_TODO_CALLEE, text))) return [];

  const candidates: ModuleScopeConstant[] = [];
  // What each module-scope name reads, its initializer or a function declaration's body, keyed by the name
  const initializerMap = new Map<string, SyntaxNode>();
  // The nodes whose identifiers pin what they name at module scope
  const pinningNodes: SyntaxNode[] = [];
  for (const statement of statements)
    if (checkIsCallTo(statement, MOCK_CALLEE, text)) pinningNodes.push(statement);
    else if (statement.type === "VariableDeclaration")
      for (const declaration of statement.declarations) {
        const initializer = declaration.init ?? undefined;
        if (initializer && declaration.id.type === "Identifier") initializerMap.set(declaration.id.name, initializer);
        if (!checkIsMovable(initializer, text)) continue;
        else if (initializer && getDescendants(initializer).some((node) => node.type === "AwaitExpression"))
          pinningNodes.push(initializer);
        else if (declaration.id.type === "Identifier") {
          const line = text.slice(0, statement.start).split("\n").length;
          candidates.push({ line, name: declaration.id.name });
        }
        // A destructuring stays at module scope and reads its initializer there, so what it reads stays too
        else if (initializer) pinningNodes.push(initializer);
      }
    else {
      const declaration = statement.type === "ExportNamedDeclaration" ? statement.declaration : statement;
      if (declaration?.type === "FunctionDeclaration" && declaration.id && declaration.body)
        initializerMap.set(declaration.id.name, declaration.body);
    }

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
