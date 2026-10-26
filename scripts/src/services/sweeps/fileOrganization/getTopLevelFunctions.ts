import type { TopLevelFunction } from "#src/models/sweeps/fileOrganization/TopLevelFunction";

import { parseSource } from "#src/services/shared/parseSource";
import { checkIsExported } from "#src/services/sweeps/fileOrganization/checkIsExported";
import { checkIsFunctionInitializer } from "#src/services/sweeps/fileOrganization/checkIsFunctionInitializer";

// Every top-level function a file declares, in source order: a `function` declaration, its overloads counted once, and
// A `const` or `let` whose initializer is a function. The file is parsed rather than matched, since an arrow's
// Parameter list spans lines and its type annotation holds a `=>` of its own. Nothing nested in a function, an object
// Literal or a class is counted, and a class is not either
export const getTopLevelFunctions = (text: string): TopLevelFunction[] => {
  const functions: TopLevelFunction[] = [];
  for (const statement of parseSource(text).body) {
    const declaration = statement.type === "ExportNamedDeclaration" ? statement.declaration : statement;
    if (declaration?.type === "FunctionDeclaration" && declaration.id)
      functions.push({ isExported: checkIsExported(declaration), name: declaration.id.name });
    else if (declaration?.type === "VariableDeclaration")
      for (const declarator of declaration.declarations)
        if (declarator.id.type === "Identifier" && checkIsFunctionInitializer(declarator.init ?? undefined))
          functions.push({ isExported: checkIsExported(declarator), name: declarator.id.name });
  }
  return functions.filter(({ name }, index) => functions.findIndex((other) => other.name === name) === index);
};
